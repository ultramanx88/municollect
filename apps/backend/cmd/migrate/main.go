package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"municollect/internal/config"
)

func main() {
	var (
		action    = flag.String("action", "up", "Migration action: up, down, rollback, status, validate")
		version   = flag.String("version", "", "Target version for rollback (optional)")
		dbURL     = flag.String("db", "", "Database URL (optional, uses DATABASE_URL env var if not provided)")
		migrationsDir = flag.String("migrations", "migrations", "Path to migrations directory")
	)
	flag.Parse()

	// Get database URL
	databaseURL := *dbURL
	if databaseURL == "" {
		databaseURL = os.Getenv("DATABASE_URL")
	}
	if databaseURL == "" {
		log.Fatal("Database URL is required. Set DATABASE_URL environment variable or use -db flag")
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Get absolute path to migrations directory
	migrationsPath, err := filepath.Abs(*migrationsDir)
	if err != nil {
		log.Fatalf("Failed to get absolute path to migrations directory: %v", err)
	}

	// Create migration runner
	runner := config.NewMigrationRunner(db, migrationsPath)

	// Execute the requested action
	switch *action {
	case "up":
		if err := runner.RunMigrations(); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}
	case "down", "rollback":
		if *version != "" {
			if err := runner.RollbackToVersion(*version); err != nil {
				log.Fatalf("Failed to rollback to version %s: %v", *version, err)
			}
		} else {
			if err := runner.RollbackMigration(); err != nil {
				log.Fatalf("Failed to rollback migration: %v", err)
			}
		}
	case "status":
		if err := runner.GetMigrationStatus(); err != nil {
			log.Fatalf("Failed to get migration status: %v", err)
		}
	case "validate":
		if err := runner.ValidateMigrations(); err != nil {
			log.Fatalf("Migration validation failed: %v", err)
		}
	default:
		fmt.Printf("Unknown action: %s\n", *action)
		fmt.Println("Available actions: up, down, rollback, status, validate")
		os.Exit(1)
	}
}