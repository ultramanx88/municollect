package handlers

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	
	"municollect/internal/models"
	"municollect/internal/services"
)

// UserHandler handles user-related requests
type UserHandler struct {
	db          *gorm.DB
	userService *services.UserService
	validator   *validator.Validate
}

// NewUserHandler creates a new user handler
func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		db:          db,
		userService: services.NewUserService(db),
		validator:   validator.New(),
	}
}

// UpdateProfileRequest represents the profile update request payload
type UpdateProfileRequest struct {
	FirstName string  `json:"firstName" validate:"required,min=1,max=100"`
	LastName  string  `json:"lastName" validate:"required,min=1,max=100"`
	Email     string  `json:"email" validate:"required,email"`
	Phone     *string `json:"phone,omitempty" validate:"omitempty,min=10,max=20"`
}

// MunicipalityAssociationRequest represents municipality association request
type MunicipalityAssociationRequest struct {
	MunicipalityID string `json:"municipalityId" validate:"required,uuid"`
}

// GetProfile returns the current user's profile
func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	// Get user ID from JWT middleware context
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "User not authenticated",
				"code":    "UNAUTHORIZED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Get user from service
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "User not found",
				"code":    "USER_NOT_FOUND",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
		"timestamp": time.Now().Unix(),
	})
}

// UpdateProfile updates the current user's profile
func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	// Get user ID from JWT middleware context
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "User not authenticated",
				"code":    "UNAUTHORIZED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	var req UpdateProfileRequest
	
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Invalid request body",
				"code":    "INVALID_REQUEST",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Validation failed",
				"code":    "VALIDATION_ERROR",
				"details": err.Error(),
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Check if email is already taken by another user
	existingUser, err := h.userService.GetUserByEmail(req.Email)
	if err == nil && existingUser.ID != userID {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Email is already taken by another user",
				"code":    "EMAIL_TAKEN",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Update user profile
	userDetails := models.UserDetails{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Phone:     req.Phone,
	}
	
	updatedUser, err := h.userService.UpdateUserProfile(userID, userDetails)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Failed to update profile",
				"code":    "UPDATE_FAILED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data":    updatedUser,
		"timestamp": time.Now().Unix(),
	})
}

// GetUserMunicipalities returns municipalities associated with the current user
func (h *UserHandler) GetUserMunicipalities(c *fiber.Ctx) error {
	// Get user ID from JWT middleware context
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "User not authenticated",
				"code":    "UNAUTHORIZED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Get user municipalities from service
	municipalities, err := h.userService.GetUserMunicipalities(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Failed to get user municipalities",
				"code":    "FETCH_FAILED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data":    municipalities,
		"timestamp": time.Now().Unix(),
	})
}

// AssociateMunicipality associates the current user with a municipality
func (h *UserHandler) AssociateMunicipality(c *fiber.Ctx) error {
	// Get user ID from JWT middleware context
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "User not authenticated",
				"code":    "UNAUTHORIZED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	var req MunicipalityAssociationRequest
	
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Invalid request body",
				"code":    "INVALID_REQUEST",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Validation failed",
				"code":    "VALIDATION_ERROR",
				"details": err.Error(),
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Associate user with municipality
	if err := h.userService.AssociateUserWithMunicipality(userID, req.MunicipalityID); err != nil {
		if err.Error() == "municipality not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"message": "Municipality not found",
					"code":    "MUNICIPALITY_NOT_FOUND",
				},
				"timestamp": time.Now().Unix(),
			})
		}
		
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Failed to associate municipality",
				"code":    "ASSOCIATION_FAILED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Municipality associated successfully",
		"timestamp": time.Now().Unix(),
	})
}

// RemoveMunicipalityAssociation removes association between user and municipality
func (h *UserHandler) RemoveMunicipalityAssociation(c *fiber.Ctx) error {
	// Get user ID from JWT middleware context
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "User not authenticated",
				"code":    "UNAUTHORIZED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Get municipality ID from URL params
	municipalityID := c.Params("municipalityId")
	if municipalityID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Municipality ID is required",
				"code":    "MISSING_MUNICIPALITY_ID",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Remove association
	if err := h.userService.RemoveUserMunicipalityAssociation(userID, municipalityID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Failed to remove municipality association",
				"code":    "REMOVAL_FAILED",
			},
			"timestamp": time.Now().Unix(),
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Municipality association removed successfully",
		"timestamp": time.Now().Unix(),
	})
}