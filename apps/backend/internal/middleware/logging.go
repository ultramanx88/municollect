package middleware

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// LoggingConfig represents logging configuration
type LoggingConfig struct {
	Format     string
	TimeFormat string
	TimeZone   string
	Output     *os.File
}

// DefaultLoggingConfig returns default logging configuration
func DefaultLoggingConfig() LoggingConfig {
	return LoggingConfig{
		Format: "${time} | ${status} | ${latency} | ${ip} | ${method} | ${path} | ${error}\n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "UTC",
		Output:     os.Stdout,
	}
}

// NewRequestIDMiddleware creates a new request ID middleware
func NewRequestIDMiddleware() fiber.Handler {
	return requestid.New(requestid.Config{
		Header: "X-Request-ID",
		Generator: func() string {
			return fmt.Sprintf("%d", time.Now().UnixNano())
		},
	})
}

// NewLoggingMiddleware creates a new logging middleware
func NewLoggingMiddleware(config ...LoggingConfig) fiber.Handler {
	var cfg LoggingConfig
	
	if len(config) > 0 {
		cfg = config[0]
	} else {
		cfg = DefaultLoggingConfig()
	}
	
	return logger.New(logger.Config{
		Format:     cfg.Format,
		TimeFormat: cfg.TimeFormat,
		TimeZone:   cfg.TimeZone,
		Output:     cfg.Output,
		CustomTags: map[string]logger.LogFunc{
			"request_id": func(output logger.Buffer, c *fiber.Ctx, data *logger.Data, extraParam string) (int, error) {
				return output.WriteString(c.Get("X-Request-ID"))
			},
		},
	})
}

// StructuredLoggingMiddleware creates a structured logging middleware
func StructuredLoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		// Process request
		err := c.Next()
		
		// Log request details
		logEntry := map[string]interface{}{
			"timestamp":   time.Now().UTC().Format(time.RFC3339),
			"request_id":  c.Get("X-Request-ID"),
			"method":      c.Method(),
			"path":        c.Path(),
			"query":       c.Request().URI().QueryArgs().String(),
			"status_code": c.Response().StatusCode(),
			"latency_ms":  time.Since(start).Milliseconds(),
			"ip":          c.IP(),
			"user_agent":  c.Get("User-Agent"),
			"referer":     c.Get("Referer"),
		}
		
		// Add user information if available
		if userID, email, role, ok := GetUserFromContext(c); ok {
			logEntry["user_id"] = userID
			logEntry["user_email"] = email
			logEntry["user_role"] = role
		}
		
		// Add error information if present
		if err != nil {
			logEntry["error"] = err.Error()
		}
		
		// Log based on status code
		statusCode := c.Response().StatusCode()
		switch {
		case statusCode >= 500:
			log.Printf("ERROR: %+v", logEntry)
		case statusCode >= 400:
			log.Printf("WARN: %+v", logEntry)
		default:
			log.Printf("INFO: %+v", logEntry)
		}
		
		return err
	}
}

// SecurityLoggingMiddleware logs security-related events
func SecurityLoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Log authentication attempts
		if c.Path() == "/api/auth/login" || c.Path() == "/api/auth/register" {
			log.Printf("AUTH_ATTEMPT: method=%s path=%s ip=%s user_agent=%s", 
				c.Method(), c.Path(), c.IP(), c.Get("User-Agent"))
		}
		
		// Log failed authentication
		err := c.Next()
		if err != nil && c.Response().StatusCode() == 401 {
			log.Printf("AUTH_FAILED: method=%s path=%s ip=%s user_agent=%s error=%s", 
				c.Method(), c.Path(), c.IP(), c.Get("User-Agent"), err.Error())
		}
		
		return err
	}
}

// DevelopmentLoggingMiddleware creates a verbose logging middleware for development
func DevelopmentLoggingMiddleware() fiber.Handler {
	return logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} - ${ip} - ${latency}\n",
		TimeFormat: "15:04:05",
		TimeZone:   "Local",
		Output:     os.Stdout,
	})
}

// ProductionLoggingMiddleware creates a structured logging middleware for production
func ProductionLoggingMiddleware() fiber.Handler {
	return StructuredLoggingMiddleware()
}