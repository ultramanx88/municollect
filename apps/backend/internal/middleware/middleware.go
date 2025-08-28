package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

// MiddlewareConfig represents the configuration for all middleware
type MiddlewareConfig struct {
	Environment      string
	AllowedOrigins   []string
	JWTSecret        string
	EnableLogging    bool
	EnableSecurity   bool
}

// SetupMiddleware configures and applies all middleware to the Fiber app
func SetupMiddleware(app *fiber.App, config MiddlewareConfig) {
	// Recovery middleware (should be first)
	app.Use(RecoverMiddleware())
	
	// Request ID middleware
	app.Use(NewRequestIDMiddleware())
	
	// CORS middleware
	if config.Environment == "development" {
		app.Use(DevelopmentCORSMiddleware())
	} else {
		app.Use(ProductionCORSMiddleware(config.AllowedOrigins))
	}
	
	// Logging middleware
	if config.EnableLogging {
		if config.Environment == "development" {
			app.Use(DevelopmentLoggingMiddleware())
		} else {
			app.Use(ProductionLoggingMiddleware())
		}
	}
	
	// Security logging middleware
	if config.EnableSecurity {
		app.Use(SecurityLoggingMiddleware())
	}
	
	// Error handling middleware (should be last)
	app.Use(ErrorHandlerMiddleware())
}

// GetDefaultConfig returns default middleware configuration
func GetDefaultConfig() MiddlewareConfig {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}
	
	return MiddlewareConfig{
		Environment:    env,
		AllowedOrigins: []string{"http://localhost:3000"},
		JWTSecret:      os.Getenv("JWT_SECRET"),
		EnableLogging:  true,
		EnableSecurity: true,
	}
}

// AuthMiddleware creates the JWT authentication middleware
func AuthMiddleware() fiber.Handler {
	authService := NewAuthService()
	return JWTMiddleware(authService)
}

// OptionalAuthMiddleware creates the optional JWT authentication middleware
func OptionalAuthMiddleware() fiber.Handler {
	authService := NewAuthService()
	return OptionalJWTMiddleware(authService)
}