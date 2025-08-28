package config

import (
	"database/sql"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

// Migration represents a database migration
type Migration struct {
	ID          int       `gorm:"primaryKey"`
	Version     string    `gorm:"uniqueIndex;not null;size:50"`
	Name        string    `gorm:"not null;size:255"`
	UpSQL       string    `gorm:"type:text"`
	DownSQL     string    `gorm:"type:text"`
	AppliedAt   time.Time `gorm:"autoCreateTime"`
	RolledBackAt *time.Time
}

// MigrationRunner handles database migrations
type MigrationRunner struct {
	db            *gorm.DB
	migrationsDir string
}

// NewMigrationRunner creates a new migration runner
func NewMigrationRunner(db *gorm.DB, migrationsDir string) *MigrationRunner {
	return &MigrationRunner{
		db:            db,
		migrationsDir: migrationsDir,
	}
}

// InitMigrationTable creates the migrations table if it doesn't exist
func (mr *MigrationRunner) InitMigrationTable() error {
	return mr.db.AutoMigrate(&Migration{})
}

// GetPendingMigrations returns migrations that haven't been applied yet
func (mr *MigrationRunner) GetPendingMigrations() ([]MigrationFile, error) {
	// Get all migration files
	allMigrations, err := mr.loadMigrationFiles()
	if err != nil {
		return nil, fmt.Errorf("failed to load migration files: %w", err)
	}

	// Get applied migrations from database
	var appliedMigrations []Migration
	if err := mr.db.Where("rolled_back_at IS NULL").Find(&appliedMigrations).Error; err != nil {
		return nil, fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Create a map of applied migration versions
	appliedVersions := make(map[string]bool)
	for _, migration := range appliedMigrations {
		appliedVersions[migration.Version] = true
	}

	// Filter out applied migrations
	var pendingMigrations []MigrationFile
	for _, migration := range allMigrations {
		if !appliedVersions[migration.Version] {
			pendingMigrations = append(pendingMigrations, migration)
		}
	}

	return pendingMigrations, nil
}

// MigrationFile represents a migration file on disk
type MigrationFile struct {
	Version  string
	Name     string
	UpSQL    string
	DownSQL  string
	FilePath string
}

// loadMigrationFiles loads all migration files from the migrations directory
func (mr *MigrationRunner) loadMigrationFiles() ([]MigrationFile, error) {
	var migrations []MigrationFile

	err := filepath.WalkDir(mr.migrationsDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		// Only process .sql files that are not rollback files
		if !strings.HasSuffix(path, ".sql") || strings.Contains(path, "_rollback.sql") {
			return nil
		}

		// Extract version and name from filename
		filename := d.Name()
		parts := strings.SplitN(filename, "_", 2)
		if len(parts) < 2 {
			return fmt.Errorf("invalid migration filename format: %s", filename)
		}

		version := parts[0]
		name := strings.TrimSuffix(parts[1], ".sql")

		// Read the up migration file
		upSQL, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", path, err)
		}

		// Try to read the corresponding rollback file
		rollbackPath := strings.Replace(path, ".sql", "_rollback.sql", 1)
		var downSQL []byte
		if _, err := os.Stat(rollbackPath); err == nil {
			downSQL, err = os.ReadFile(rollbackPath)
			if err != nil {
				return fmt.Errorf("failed to read rollback file %s: %w", rollbackPath, err)
			}
		}

		migrations = append(migrations, MigrationFile{
			Version:  version,
			Name:     name,
			UpSQL:    string(upSQL),
			DownSQL:  string(downSQL),
			FilePath: path,
		})

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort migrations by version
	sort.Slice(migrations, func(i, j int) bool {
		versionI, _ := strconv.Atoi(migrations[i].Version)
		versionJ, _ := strconv.Atoi(migrations[j].Version)
		return versionI < versionJ
	})

	return migrations, nil
}

// RunMigrations applies all pending migrations
func (mr *MigrationRunner) RunMigrations() error {
	// Initialize migration table
	if err := mr.InitMigrationTable(); err != nil {
		return fmt.Errorf("failed to initialize migration table: %w", err)
	}

	// Get pending migrations
	pendingMigrations, err := mr.GetPendingMigrations()
	if err != nil {
		return fmt.Errorf("failed to get pending migrations: %w", err)
	}

	if len(pendingMigrations) == 0 {
		fmt.Println("No pending migrations to run")
		return nil
	}

	fmt.Printf("Running %d pending migrations...\n", len(pendingMigrations))

	// Apply each migration in a transaction
	for _, migrationFile := range pendingMigrations {
		if err := mr.applyMigration(migrationFile); err != nil {
			return fmt.Errorf("failed to apply migration %s: %w", migrationFile.Version, err)
		}
		fmt.Printf("Applied migration %s: %s\n", migrationFile.Version, migrationFile.Name)
	}

	fmt.Println("All migrations applied successfully")
	return nil
}

// applyMigration applies a single migration
func (mr *MigrationRunner) applyMigration(migrationFile MigrationFile) error {
	return mr.db.Transaction(func(tx *gorm.DB) error {
		// Execute the migration SQL
		if err := tx.Exec(migrationFile.UpSQL).Error; err != nil {
			return fmt.Errorf("failed to execute migration SQL: %w", err)
		}

		// Record the migration in the database
		migration := Migration{
			Version: migrationFile.Version,
			Name:    migrationFile.Name,
			UpSQL:   migrationFile.UpSQL,
			DownSQL: migrationFile.DownSQL,
		}

		if err := tx.Create(&migration).Error; err != nil {
			return fmt.Errorf("failed to record migration: %w", err)
		}

		return nil
	})
}

// RollbackMigration rolls back the last applied migration
func (mr *MigrationRunner) RollbackMigration() error {
	// Get the last applied migration
	var lastMigration Migration
	if err := mr.db.Where("rolled_back_at IS NULL").Order("applied_at DESC").First(&lastMigration).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			fmt.Println("No migrations to rollback")
			return nil
		}
		return fmt.Errorf("failed to get last migration: %w", err)
	}

	if lastMigration.DownSQL == "" {
		return fmt.Errorf("migration %s has no rollback SQL", lastMigration.Version)
	}

	fmt.Printf("Rolling back migration %s: %s\n", lastMigration.Version, lastMigration.Name)

	// Apply rollback in a transaction
	return mr.db.Transaction(func(tx *gorm.DB) error {
		// Execute the rollback SQL
		if err := tx.Exec(lastMigration.DownSQL).Error; err != nil {
			return fmt.Errorf("failed to execute rollback SQL: %w", err)
		}

		// Mark the migration as rolled back
		now := time.Now()
		lastMigration.RolledBackAt = &now
		if err := tx.Save(&lastMigration).Error; err != nil {
			return fmt.Errorf("failed to mark migration as rolled back: %w", err)
		}

		fmt.Printf("Rolled back migration %s successfully\n", lastMigration.Version)
		return nil
	})
}

// RollbackToVersion rolls back migrations to a specific version
func (mr *MigrationRunner) RollbackToVersion(targetVersion string) error {
	// Get all applied migrations after the target version
	var migrationsToRollback []Migration
	if err := mr.db.Where("rolled_back_at IS NULL AND version > ?", targetVersion).
		Order("applied_at DESC").Find(&migrationsToRollback).Error; err != nil {
		return fmt.Errorf("failed to get migrations to rollback: %w", err)
	}

	if len(migrationsToRollback) == 0 {
		fmt.Printf("Already at version %s or earlier\n", targetVersion)
		return nil
	}

	fmt.Printf("Rolling back %d migrations to version %s...\n", len(migrationsToRollback), targetVersion)

	// Rollback each migration
	for _, migration := range migrationsToRollback {
		if migration.DownSQL == "" {
			return fmt.Errorf("migration %s has no rollback SQL", migration.Version)
		}

		if err := mr.rollbackSingleMigration(migration); err != nil {
			return fmt.Errorf("failed to rollback migration %s: %w", migration.Version, err)
		}
		fmt.Printf("Rolled back migration %s: %s\n", migration.Version, migration.Name)
	}

	fmt.Printf("Successfully rolled back to version %s\n", targetVersion)
	return nil
}

// rollbackSingleMigration rolls back a single migration
func (mr *MigrationRunner) rollbackSingleMigration(migration Migration) error {
	return mr.db.Transaction(func(tx *gorm.DB) error {
		// Execute the rollback SQL
		if err := tx.Exec(migration.DownSQL).Error; err != nil {
			return fmt.Errorf("failed to execute rollback SQL: %w", err)
		}

		// Mark the migration as rolled back
		now := time.Now()
		migration.RolledBackAt = &now
		if err := tx.Save(&migration).Error; err != nil {
			return fmt.Errorf("failed to mark migration as rolled back: %w", err)
		}

		return nil
	})
}

// GetMigrationStatus returns the current migration status
func (mr *MigrationRunner) GetMigrationStatus() error {
	// Get all migration files
	allMigrations, err := mr.loadMigrationFiles()
	if err != nil {
		return fmt.Errorf("failed to load migration files: %w", err)
	}

	// Get applied migrations from database
	var appliedMigrations []Migration
	if err := mr.db.Find(&appliedMigrations).Error; err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Create a map of applied migrations
	appliedMap := make(map[string]Migration)
	for _, migration := range appliedMigrations {
		appliedMap[migration.Version] = migration
	}

	fmt.Println("Migration Status:")
	fmt.Println("================")

	for _, migrationFile := range allMigrations {
		if applied, exists := appliedMap[migrationFile.Version]; exists {
			if applied.RolledBackAt != nil {
				fmt.Printf("❌ %s: %s (rolled back at %s)\n", 
					migrationFile.Version, migrationFile.Name, applied.RolledBackAt.Format(time.RFC3339))
			} else {
				fmt.Printf("✅ %s: %s (applied at %s)\n", 
					migrationFile.Version, migrationFile.Name, applied.AppliedAt.Format(time.RFC3339))
			}
		} else {
			fmt.Printf("⏳ %s: %s (pending)\n", migrationFile.Version, migrationFile.Name)
		}
	}

	return nil
}

// ValidateMigrations validates that all migration files are properly formatted
func (mr *MigrationRunner) ValidateMigrations() error {
	migrations, err := mr.loadMigrationFiles()
	if err != nil {
		return fmt.Errorf("failed to load migration files: %w", err)
	}

	fmt.Printf("Validating %d migration files...\n", len(migrations))

	for _, migration := range migrations {
		// Check version format
		if _, err := strconv.Atoi(migration.Version); err != nil {
			return fmt.Errorf("invalid version format in migration %s: %w", migration.Version, err)
		}

		// Check that up SQL is not empty
		if strings.TrimSpace(migration.UpSQL) == "" {
			return fmt.Errorf("migration %s has empty up SQL", migration.Version)
		}

		// Warn if down SQL is empty
		if strings.TrimSpace(migration.DownSQL) == "" {
			fmt.Printf("⚠️  Migration %s has no rollback SQL\n", migration.Version)
		}

		fmt.Printf("✅ Migration %s: %s\n", migration.Version, migration.Name)
	}

	fmt.Println("All migrations are valid")
	return nil
}