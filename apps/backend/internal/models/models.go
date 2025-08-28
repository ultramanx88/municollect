package models

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

// Package-level validator instance
var validate *validator.Validate

func init() {
	validate = validator.New()
	
	// Register custom validation tags
	validate.RegisterValidation("uuid", validateUUID)
	
	// Register additional custom validators
	RegisterCustomValidators(validate)
}

// validateUUID validates UUID format
func validateUUID(fl validator.FieldLevel) bool {
	uuid := fl.Field().String()
	if len(uuid) != 36 {
		return false
	}
	
	// Basic UUID format validation (8-4-4-4-12)
	parts := strings.Split(uuid, "-")
	if len(parts) != 5 {
		return false
	}
	
	expectedLengths := []int{8, 4, 4, 4, 12}
	for i, part := range parts {
		if len(part) != expectedLengths[i] {
			return false
		}
	}
	
	return true
}

// ValidateStruct validates a struct using the validator tags
func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}

// ValidateStructWithDB validates a struct and performs database-specific validations
func ValidateStructWithDB(db *gorm.DB, s interface{}) error {
	// First, validate struct tags
	if err := ValidateStruct(s); err != nil {
		return err
	}
	
	// Perform database-specific validations
	switch v := s.(type) {
	case *User:
		return validateUser(db, v)
	case *Municipality:
		return validateMunicipality(db, v)
	case *Payment:
		return validatePayment(db, v)
	case *Notification:
		return validateNotification(db, v)
	}
	
	return nil
}

// validateUser performs database-specific validation for User
func validateUser(db *gorm.DB, user *User) error {
	// Check if email is unique (for new users or email changes)
	if user.ID == "" || db.Where("email = ? AND id != ?", user.Email, user.ID).First(&User{}).Error == nil {
		var existingUser User
		if db.Where("email = ?", user.Email).First(&existingUser).Error == nil {
			if user.ID == "" || existingUser.ID != user.ID {
				return fmt.Errorf("email already exists")
			}
		}
	}
	
	return nil
}

// validateMunicipality performs database-specific validation for Municipality
func validateMunicipality(db *gorm.DB, municipality *Municipality) error {
	// Check if code is unique
	if municipality.ID == "" || db.Where("code = ? AND id != ?", municipality.Code, municipality.ID).First(&Municipality{}).Error == nil {
		var existingMunicipality Municipality
		if db.Where("code = ?", municipality.Code).First(&existingMunicipality).Error == nil {
			if municipality.ID == "" || existingMunicipality.ID != municipality.ID {
				return fmt.Errorf("municipality code already exists")
			}
		}
	}
	
	// Validate payment config if present
	if municipality.PaymentConfig != nil {
		if err := ValidateStruct(municipality.PaymentConfig); err != nil {
			return fmt.Errorf("invalid payment config: %w", err)
		}
	}
	
	return nil
}

// validatePayment performs database-specific validation for Payment
func validatePayment(db *gorm.DB, payment *Payment) error {
	// Check if municipality exists
	var municipality Municipality
	if db.First(&municipality, "id = ?", payment.MunicipalityID).Error != nil {
		return fmt.Errorf("municipality not found")
	}
	
	// Check if user exists
	var user User
	if db.First(&user, "id = ?", payment.UserID).Error != nil {
		return fmt.Errorf("user not found")
	}
	
	// Check if QR code is unique (if provided)
	if payment.QRCode != nil && *payment.QRCode != "" {
		var existingPayment Payment
		if db.Where("qr_code = ? AND id != ?", *payment.QRCode, payment.ID).First(&existingPayment).Error == nil {
			return fmt.Errorf("QR code already exists")
		}
	}
	
	return nil
}

// validateNotification performs database-specific validation for Notification
func validateNotification(db *gorm.DB, notification *Notification) error {
	// Check if user exists
	var user User
	if db.First(&user, "id = ?", notification.UserID).Error != nil {
		return fmt.Errorf("user not found")
	}
	
	return nil
}

// GetValidationErrors extracts validation errors and returns them in a user-friendly format
func GetValidationErrors(err error) map[string]string {
	errors := make(map[string]string)
	
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldError := range validationErrors {
			fieldName := getJSONFieldName(fieldError)
			errors[fieldName] = getValidationErrorMessage(fieldError)
		}
	}
	
	return errors
}

// getJSONFieldName extracts the JSON field name from validation error
func getJSONFieldName(fieldError validator.FieldError) string {
	// This is a simplified version - in a real implementation,
	// you might want to use reflection to get the actual JSON tag
	fieldName := fieldError.Field()
	
	// Convert PascalCase to camelCase for JSON compatibility
	if len(fieldName) > 0 {
		return strings.ToLower(fieldName[:1]) + fieldName[1:]
	}
	
	return fieldName
}

// getValidationErrorMessage returns a user-friendly error message for validation errors
func getValidationErrorMessage(fieldError validator.FieldError) string {
	field := fieldError.Field()
	tag := fieldError.Tag()
	
	switch tag {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", field, fieldError.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters long", field, fieldError.Param())
	case "gt":
		return fmt.Sprintf("%s must be greater than %s", field, fieldError.Param())
	case "gte":
		return fmt.Sprintf("%s must be greater than or equal to %s", field, fieldError.Param())
	case "lt":
		return fmt.Sprintf("%s must be less than %s", field, fieldError.Param())
	case "lte":
		return fmt.Sprintf("%s must be less than or equal to %s", field, fieldError.Param())
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, fieldError.Param())
	case "uuid":
		return fmt.Sprintf("%s must be a valid UUID", field)
	default:
		return fmt.Sprintf("%s is invalid", field)
	}
}

// AutoMigrate runs auto-migration for all models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Municipality{},
		&UserMunicipality{},
		&Payment{},
		&PaymentTransaction{},
		&Notification{},
	)
}