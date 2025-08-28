package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// CORSConfig represents CORS configuration
type CORSConfig struct {
	AllowOrigins     []string
	AllowMethods     []string
	AllowHeaders     []string
	AllowCredentials bool
	ExposeHeaders    []string
	MaxAge           int
}

// DefaultCORSConfig returns default CORS configuration
func DefaultCORSConfig() CORSConfig {
	return CORSConfig{
		AllowOrigins: []string{
			"http://localhost:3000",  // Frontend development
			"http://localhost:3001",  // Alternative frontend port
			"https://municollect.com", // Production domain (example)
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"PATCH",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-CSRF-Token",
		},
		AllowCredentials: true,
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
		},
		MaxAge: 86400, // 24 hours
	}
}

// NewCORSMiddleware creates a new CORS middleware with configuration
func NewCORSMiddleware(config ...CORSConfig) fiber.Handler {
	var cfg CORSConfig
	
	if len(config) > 0 {
		cfg = config[0]
	} else {
		cfg = DefaultCORSConfig()
	}
	
	// Get allowed origins from environment variable if set
	if envOrigins := os.Getenv("CORS_ALLOWED_ORIGINS"); envOrigins != "" {
		cfg.AllowOrigins = strings.Split(envOrigins, ",")
		// Trim whitespace from each origin
		for i, origin := range cfg.AllowOrigins {
			cfg.AllowOrigins[i] = strings.TrimSpace(origin)
		}
	}
	
	return cors.New(cors.Config{
		AllowOrigins:     strings.Join(cfg.AllowOrigins, ","),
		AllowMethods:     strings.Join(cfg.AllowMethods, ","),
		AllowHeaders:     strings.Join(cfg.AllowHeaders, ","),
		AllowCredentials: cfg.AllowCredentials,
		ExposeHeaders:    strings.Join(cfg.ExposeHeaders, ","),
		MaxAge:           cfg.MaxAge,
	})
}

// DevelopmentCORSMiddleware creates a permissive CORS middleware for development
func DevelopmentCORSMiddleware() fiber.Handler {
	return cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "*",
		AllowCredentials: false,
	})
}

// ProductionCORSMiddleware creates a strict CORS middleware for production
func ProductionCORSMiddleware(allowedOrigins []string) fiber.Handler {
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"https://municollect.com"} // Default production domain
	}
	
	return cors.New(cors.Config{
		AllowOrigins: strings.Join(allowedOrigins, ","),
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-Requested-With",
		AllowCredentials: true,
		ExposeHeaders: "Content-Length,Content-Type",
		MaxAge: 86400,
	})
}