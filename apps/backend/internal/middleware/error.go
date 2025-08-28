package middleware

import (
	"errors"
	"log"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CustomError represents a custom application error
type CustomError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func (e *CustomError) Error() string {
	return e.Message
}

// NewCustomError creates a new custom error
func NewCustomError(code int, message string, details ...string) *CustomError {
	err := &CustomError{
		Code:    code,
		Message: message,
	}
	if len(details) > 0 {
		err.Details = details[0]
	}
	return err
}

// Common error constructors
func NewBadRequestError(message string, details ...string) *CustomError {
	return NewCustomError(fiber.StatusBadRequest, message, details...)
}

func NewUnauthorizedError(message string, details ...string) *CustomError {
	return NewCustomError(fiber.StatusUnauthorized, message, details...)
}

func NewForbiddenError(message string, details ...string) *CustomError {
	return NewCustomError(fiber.StatusForbidden, message, details...)
}

func NewNotFoundError(message string, details ...string) *CustomError {
	return NewCustomError(fiber.StatusNotFound, message, details...)
}

func NewConflictError(message string, details ...string) *CustomError {
	return NewCustomError(fiber.StatusConflict, message, details...)
}

func NewInternalServerError(message string, details ...string) *CustomError {
	return NewCustomError(fiber.StatusInternalServerError, message, details...)
}

// ErrorHandlerMiddleware creates a centralized error handling middleware
func ErrorHandlerMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Process the request
		err := c.Next()
		
		if err != nil {
			return handleError(c, err)
		}
		
		return nil
	}
}

// handleError processes different types of errors and returns appropriate responses
func handleError(c *fiber.Ctx, err error) error {
	var customErr *CustomError
	var fiberErr *fiber.Error
	var validationErr validator.ValidationErrors
	
	// Log the error for debugging
	log.Printf("Error occurred: %v", err)
	
	switch {
	case errors.As(err, &customErr):
		// Handle custom application errors
		return c.Status(customErr.Code).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": customErr.Message,
				"code":    customErr.Code,
				"details": customErr.Details,
			},
			"timestamp": time.Now().Unix(),
		})
		
	case errors.As(err, &fiberErr):
		// Handle Fiber framework errors
		return c.Status(fiberErr.Code).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": fiberErr.Message,
				"code":    fiberErr.Code,
			},
			"timestamp": time.Now().Unix(),
		})
		
	case errors.As(err, &validationErr):
		// Handle validation errors
		var validationErrors []fiber.Map
		for _, fieldErr := range validationErr {
			validationErrors = append(validationErrors, fiber.Map{
				"field":   fieldErr.Field(),
				"value":   fieldErr.Value(),
				"message": getValidationErrorMessage(fieldErr),
			})
		}
		
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Validation failed",
				"code":    fiber.StatusBadRequest,
				"details": validationErrors,
			},
			"timestamp": time.Now().Unix(),
		})
		
	case errors.Is(err, gorm.ErrRecordNotFound):
		// Handle GORM record not found errors
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Resource not found",
				"code":    fiber.StatusNotFound,
			},
			"timestamp": time.Now().Unix(),
		})
		
	default:
		// Handle unexpected errors
		log.Printf("Unexpected error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Internal server error",
				"code":    fiber.StatusInternalServerError,
			},
			"timestamp": time.Now().Unix(),
		})
	}
}

// getValidationErrorMessage returns a user-friendly validation error message
func getValidationErrorMessage(fieldErr validator.FieldError) string {
	switch fieldErr.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Must be a valid email address"
	case "min":
		return "Must be at least " + fieldErr.Param() + " characters long"
	case "max":
		return "Must be at most " + fieldErr.Param() + " characters long"
	case "len":
		return "Must be exactly " + fieldErr.Param() + " characters long"
	case "numeric":
		return "Must be a number"
	case "alpha":
		return "Must contain only letters"
	case "alphanum":
		return "Must contain only letters and numbers"
	case "phone":
		return "Must be a valid phone number"
	case "user_role":
		return "Must be a valid user role (resident, municipal_staff, admin)"
	default:
		return "Invalid value"
	}
}

// RecoverMiddleware creates a panic recovery middleware
func RecoverMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panic recovered: %v", r)
				
				err := c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"error": fiber.Map{
						"message": "Internal server error",
						"code":    fiber.StatusInternalServerError,
					},
					"timestamp": time.Now().Unix(),
				})
				
				if err != nil {
					log.Printf("Failed to send error response: %v", err)
				}
			}
		}()
		
		return c.Next()
	}
}

// NotFoundMiddleware handles 404 errors
func NotFoundMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Endpoint not found",
				"code":    fiber.StatusNotFound,
				"path":    c.Path(),
			},
			"timestamp": time.Now().Unix(),
		})
	}
}

// ErrorHandler is the global error handler for Fiber
func ErrorHandler(c *fiber.Ctx, err error) error {
	return handleError(c, err)
}