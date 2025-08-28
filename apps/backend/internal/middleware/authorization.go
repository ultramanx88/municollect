package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

// Role represents user roles in the system
type Role string

const (
	RoleResident       Role = "resident"
	RoleMunicipalStaff Role = "municipal_staff"
	RoleAdmin          Role = "admin"
)

// RoleHierarchy defines the role hierarchy for authorization
var RoleHierarchy = map[Role]int{
	RoleResident:       1,
	RoleMunicipalStaff: 2,
	RoleAdmin:          3,
}

// RequireRole creates middleware that requires a specific role or higher
func RequireRole(requiredRole Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user role from context (set by JWT middleware)
		userRole, _, _, ok := GetUserFromContext(c)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
				"code":  fiber.StatusUnauthorized,
				"timestamp": time.Now().Unix(),
			})
		}
		
		// Check if user has required role or higher
		if !hasRequiredRole(Role(userRole), requiredRole) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Insufficient permissions",
				"code":  fiber.StatusForbidden,
				"timestamp": time.Now().Unix(),
			})
		}
		
		return c.Next()
	}
}

// RequireRoles creates middleware that requires one of the specified roles
func RequireRoles(allowedRoles ...Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user role from context (set by JWT middleware)
		_, _, userRoleStr, ok := GetUserFromContext(c)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
				"code":  fiber.StatusUnauthorized,
				"timestamp": time.Now().Unix(),
			})
		}
		
		userRole := Role(userRoleStr)
		
		// Check if user has any of the allowed roles
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				return c.Next()
			}
		}
		
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Insufficient permissions",
			"code":  fiber.StatusForbidden,
			"timestamp": time.Now().Unix(),
		})
	}
}

// RequireAdmin creates middleware that requires admin role
func RequireAdmin() fiber.Handler {
	return RequireRole(RoleAdmin)
}

// RequireMunicipalStaffOrAdmin creates middleware that requires municipal staff or admin role
func RequireMunicipalStaffOrAdmin() fiber.Handler {
	return RequireRoles(RoleMunicipalStaff, RoleAdmin)
}

// RequireOwnershipOrAdmin creates middleware that checks if user owns the resource or is admin
func RequireOwnershipOrAdmin(getUserIDFromParams func(*fiber.Ctx) string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user from context
		currentUserID, _, userRoleStr, ok := GetUserFromContext(c)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
				"code":  fiber.StatusUnauthorized,
				"timestamp": time.Now().Unix(),
			})
		}
		
		// Admin can access everything
		if Role(userRoleStr) == RoleAdmin {
			return c.Next()
		}
		
		// Get resource owner ID from parameters
		resourceOwnerID := getUserIDFromParams(c)
		
		// Check if current user owns the resource
		if currentUserID == resourceOwnerID {
			return c.Next()
		}
		
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Access denied: insufficient permissions",
			"code":  fiber.StatusForbidden,
			"timestamp": time.Now().Unix(),
		})
	}
}

// hasRequiredRole checks if user role meets the minimum required role
func hasRequiredRole(userRole, requiredRole Role) bool {
	userLevel, userExists := RoleHierarchy[userRole]
	requiredLevel, requiredExists := RoleHierarchy[requiredRole]
	
	if !userExists || !requiredExists {
		return false
	}
	
	return userLevel >= requiredLevel
}

// GetUserIDFromPathParam returns a function that extracts user ID from path parameter
func GetUserIDFromPathParam(paramName string) func(*fiber.Ctx) string {
	return func(c *fiber.Ctx) string {
		return c.Params(paramName)
	}
}

// GetUserIDFromQuery returns a function that extracts user ID from query parameter
func GetUserIDFromQuery(paramName string) func(*fiber.Ctx) string {
	return func(c *fiber.Ctx) string {
		return c.Query(paramName)
	}
}

// GetCurrentUserID returns a function that gets the current user's ID from context
func GetCurrentUserID() func(*fiber.Ctx) string {
	return func(c *fiber.Ctx) string {
		userID, _, _, _ := GetUserFromContext(c)
		return userID
	}
}