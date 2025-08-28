package main

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	
	"municollect/internal/config"
	"municollect/internal/handlers"
	"municollect/internal/middleware"
	"municollect/internal/models"
	"municollect/internal/services"
)

func main() {
	// Connect to database
	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	// Run auto-migration
	if err := models.AutoMigrate(db); err != nil {
		log.Fatalf("Failed to run auto-migration: %v", err)
	}
	
	// Initialize services and handlers
	authService := middleware.NewAuthService()
	municipalityService := services.NewMunicipalityService(db)
	paymentService := services.NewPaymentService(db)
	qrCodeService := services.NewQRCodeService(db)
	
	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler(db)
	municipalityHandler := handlers.NewMunicipalityHandler(municipalityService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	qrCodeHandler := handlers.NewQRCodeHandler(qrCodeService)
	
	app := fiber.New(fiber.Config{
		AppName:      "MuniCollect Backend API v1.0.0",
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		ErrorHandler: middleware.ErrorHandler,
	})

	// Basic middleware
	app.Use(recover.New())
	app.Use(logger.New())
	
	// CORS middleware
	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3000"
	}
	
	app.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		// Check database health
		if err := config.HealthCheck(db); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"status":    "error",
				"message":   "Database connection failed",
				"timestamp": time.Now().Unix(),
			})
		}
		
		return c.JSON(fiber.Map{
			"status":    "ok",
			"message":   "MuniCollect Backend API is running",
			"database":  "connected",
			"timestamp": time.Now().Unix(),
		})
	})

	// API routes
	api := app.Group("/api")
	
	// Public API info endpoint
	api.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message":   "MuniCollect API v1.0.0",
			"timestamp": time.Now().Unix(),
		})
	})

	// Authentication routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.RefreshToken)
	auth.Delete("/logout", authHandler.Logout)

	// Protected user routes
	users := api.Group("/users")
	users.Use(middleware.JWTMiddleware(authService))
	users.Get("/profile", userHandler.GetProfile)
	users.Put("/profile", userHandler.UpdateProfile)
	users.Get("/municipalities", userHandler.GetUserMunicipalities)
	users.Post("/municipalities", userHandler.AssociateMunicipality)
	users.Delete("/municipalities/:municipalityId", userHandler.RemoveMunicipalityAssociation)

	// Municipality routes
	municipalities := api.Group("/municipalities")
	
	// Public municipality routes (for listing and getting municipality info)
	municipalities.Get("/", municipalityHandler.GetMunicipalities)
	municipalities.Get("/:id", municipalityHandler.GetMunicipality)
	municipalities.Get("/code/:code", municipalityHandler.GetMunicipalityByCode)
	
	// Protected municipality routes (admin only)
	municipalitiesAdmin := municipalities.Use(middleware.JWTMiddleware(authService))
	municipalitiesAdmin.Use(middleware.RequireRole("admin"))
	municipalitiesAdmin.Post("/", municipalityHandler.CreateMunicipality)
	municipalitiesAdmin.Put("/:id", municipalityHandler.UpdateMunicipality)
	municipalitiesAdmin.Delete("/:id", municipalityHandler.DeleteMunicipality)

	// Payment routes
	payments := api.Group("/payments")
	payments.Use(middleware.JWTMiddleware(authService))
	
	// User payment routes
	payments.Post("/initiate", paymentHandler.CreatePayment)
	payments.Get("/user", paymentHandler.GetUserPayments)
	payments.Get("/history", paymentHandler.GetPaymentHistory)
	payments.Get("/:id", paymentHandler.GetPayment)
	payments.Get("/:id/status", paymentHandler.GetPaymentStatus)
	
	// Admin payment routes
	paymentsAdmin := payments.Use(middleware.RequireRole("admin"))
	paymentsAdmin.Put("/:id/status", paymentHandler.UpdatePaymentStatus)
	paymentsAdmin.Get("/municipality/:municipalityId", paymentHandler.GetMunicipalityPayments)

	// QR Code routes
	qr := api.Group("/qr")
	
	// Public QR code routes (for validation)
	qr.Post("/validate", qrCodeHandler.ValidateQRCode)
	qr.Get("/:code/details", qrCodeHandler.GetQRCodeDetails)
	
	// Protected QR code routes
	qrProtected := qr.Use(middleware.JWTMiddleware(authService))
	qrProtected.Post("/generate", qrCodeHandler.GenerateQRCode)
	qrProtected.Post("/:paymentId/regenerate", qrCodeHandler.RegenerateQRCode)
	qrProtected.Get("/:paymentId/image", qrCodeHandler.GetQRCodeImage)
	qrProtected.Get("/payment/:paymentId", qrCodeHandler.GetQRCodeByPayment)

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message": "Endpoint not found",
				"code":    fiber.StatusNotFound,
				"path":    c.Path(),
			},
			"timestamp": time.Now().Unix(),
		})
	})

	log.Println("Starting server on :8080")
	log.Fatal(app.Listen(":8080"))
}