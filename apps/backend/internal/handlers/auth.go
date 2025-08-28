package handlers

import (
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	
	"municollect/internal/models"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	UserRoleResident       UserRole = "resident"
	UserRoleMunicipalStaff UserRole = "municipal_staff"
	UserRoleAdmin          UserRole = "admin"
)

// User represents a user in the system (simplified for auth handler)
type User struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email     string    `json:"email" gorm:"uniqueIndex:idx_users_email;not null;size:255"`
	FirstName string    `json:"firstName" gorm:"column:first_name;not null;size:100"`
	LastName  string    `json:"lastName" gorm:"column:last_name;not null;size:100"`
	Phone     *string   `json:"phone,omitempty" gorm:"size:20"`
	Role      UserRole  `json:"role" gorm:"type:varchar(20);default:resident"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

// Auth represents user authentication data
type Auth struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID       string    `json:"userId" gorm:"uniqueIndex:idx_auth_user_id;not null;type:uuid"`
	PasswordHash string    `json:"-" gorm:"column:password_hash;not null;size:255"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	db          *gorm.DB
	authService *AuthService
	validator   *validator.Validate
}

// NewAuthHandler creates a new authentication handler
func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		db:          db,
		authService: NewAuthService(),
		validator:   validator.New(),
	}
}

// RegisterRequest represents the registration request payload
type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"firstName" validate:"required,min=1,max=100"`
	LastName  string `json:"lastName" validate:"required,min=1,max=100"`
	Phone     string `json:"phone,omitempty" validate:"omitempty,min=10,max=20"`
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         User      `json:"user"`
	ExpiresAt    time.Time `json:"expiresAt"`
}

// RefreshTokenRequest represents the refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

// Register handles user registration
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"code":  fiber.StatusBadRequest,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Validation failed",
			"code":  fiber.StatusBadRequest,
			"details": err.Error(),
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Check if user already exists
	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "User with this email already exists",
			"code":  fiber.StatusConflict,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Hash password
	hashedPassword, err := h.authService.HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process password",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Create user
	user := models.User{
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      models.UserRoleResident,
	}
	
	if req.Phone != "" {
		user.Phone = &req.Phone
	}
	
	// Start transaction
	tx := h.db.Begin()
	
	// Create user record
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Create auth record with hashed password
	authRecord := models.Auth{
		UserID:       user.ID,
		PasswordHash: hashedPassword,
	}
	
	if err := tx.Create(&authRecord).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create authentication record",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to complete registration",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Generate tokens
	accessToken, refreshToken, expiresAt, err := h.authService.GenerateTokens(
		user.ID, 
		user.Email, 
		string(user.Role),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate authentication tokens",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Return success response
	response := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
		ExpiresAt:    expiresAt,
	}
	
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data": response,
		"timestamp": time.Now().Unix(),
	})
}

// Login handles user authentication
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"code":  fiber.StatusBadRequest,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Validation failed",
			"code":  fiber.StatusBadRequest,
			"details": err.Error(),
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Find user by email
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Get auth record
	var authRecord models.Auth
	if err := h.db.Where("user_id = ?", user.ID).First(&authRecord).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Check password
	if !h.authService.CheckPassword(req.Password, authRecord.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Generate tokens
	accessToken, refreshToken, expiresAt, err := h.authService.GenerateTokens(
		user.ID, 
		user.Email, 
		string(user.Role),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate authentication tokens",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Return success response
	response := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
		ExpiresAt:    expiresAt,
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data": response,
		"timestamp": time.Now().Unix(),
	})
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var req RefreshTokenRequest
	
	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"code":  fiber.StatusBadRequest,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Validation failed",
			"code":  fiber.StatusBadRequest,
			"details": err.Error(),
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Validate refresh token
	claims, err := h.authService.ValidateToken(req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired refresh token",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Check if it's actually a refresh token (by issuer)
	if claims.Issuer != "municollect-refresh" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token type",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Get user to ensure they still exist
	var user models.User
	if err := h.db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User not found",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Generate new tokens
	accessToken, refreshToken, expiresAt, err := h.authService.GenerateTokens(
		user.ID, 
		user.Email, 
		string(user.Role),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate authentication tokens",
			"code":  fiber.StatusInternalServerError,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Return success response
	response := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
		ExpiresAt:    expiresAt,
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data": response,
		"timestamp": time.Now().Unix(),
	})
}

// Logout handles user logout (token invalidation)
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	// In a stateless JWT system, logout is typically handled client-side
	// by removing the token from storage. However, we can add token blacklisting
	// or other server-side logout logic here if needed.
	
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logged out successfully",
		"timestamp": time.Now().Unix(),
	})
}

// GetProfile returns the current user's profile
func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	// Get user from context (set by JWT middleware)
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User not authenticated",
			"code":  fiber.StatusUnauthorized,
			"timestamp": time.Now().Unix(),
		})
	}
	
	// Get user from database
	var user User
	if err := h.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
			"code":  fiber.StatusNotFound,
			"timestamp": time.Now().Unix(),
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data": user,
		"timestamp": time.Now().Unix(),
	})
}