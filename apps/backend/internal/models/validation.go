package models

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

// Custom validation functions

// ValidatePaymentConfig validates payment configuration
func ValidatePaymentConfig(config *PaymentConfig) error {
	if config == nil {
		return nil
	}

	// Validate currency
	validCurrencies := map[string]bool{
		"USD": true,
		"EUR": true,
		"GBP": true,
	}
	if !validCurrencies[config.Currency] {
		return fmt.Errorf("invalid currency: %s", config.Currency)
	}

	// Validate payment methods
	if len(config.PaymentMethods) == 0 {
		return fmt.Errorf("at least one payment method is required")
	}

	validPaymentMethods := map[string]bool{
		"credit_card": true,
		"debit_card":  true,
		"bank_transfer": true,
		"cash": true,
		"mobile_payment": true,
	}

	for _, method := range config.PaymentMethods {
		if !validPaymentMethods[method] {
			return fmt.Errorf("invalid payment method: %s", method)
		}
	}

	// Validate QR code expiration
	if config.QRCodeExpirationMinutes < 1 || config.QRCodeExpirationMinutes > 1440 {
		return fmt.Errorf("QR code expiration must be between 1 and 1440 minutes")
	}

	// Validate waste management fee if provided
	if config.WasteManagementFee != nil && *config.WasteManagementFee < 0 {
		return fmt.Errorf("waste management fee cannot be negative")
	}

	return nil
}

// ValidateUserRole validates user role
func ValidateUserRole(role UserRole) error {
	validRoles := map[UserRole]bool{
		UserRoleResident:       true,
		UserRoleMunicipalStaff: true,
		UserRoleAdmin:          true,
	}

	if !validRoles[role] {
		return fmt.Errorf("invalid user role: %s", role)
	}

	return nil
}

// ValidateServiceType validates service type
func ValidateServiceType(serviceType ServiceType) error {
	validTypes := map[ServiceType]bool{
		ServiceTypeWasteManagement: true,
		ServiceTypeWaterBill:       true,
	}

	if !validTypes[serviceType] {
		return fmt.Errorf("invalid service type: %s", serviceType)
	}

	return nil
}

// ValidatePaymentStatus validates payment status
func ValidatePaymentStatus(status PaymentStatus) error {
	validStatuses := map[PaymentStatus]bool{
		PaymentStatusPending:   true,
		PaymentStatusCompleted: true,
		PaymentStatusFailed:    true,
		PaymentStatusExpired:   true,
	}

	if !validStatuses[status] {
		return fmt.Errorf("invalid payment status: %s", status)
	}

	return nil
}

// ValidateCurrency validates currency
func ValidateCurrency(currency Currency) error {
	validCurrencies := map[Currency]bool{
		CurrencyUSD: true,
		CurrencyEUR: true,
		CurrencyGBP: true,
	}

	if !validCurrencies[currency] {
		return fmt.Errorf("invalid currency: %s", currency)
	}

	return nil
}

// ValidateNotificationType validates notification type
func ValidateNotificationType(notificationType NotificationType) error {
	validTypes := map[NotificationType]bool{
		NotificationTypePaymentReminder:    true,
		NotificationTypePaymentConfirmation: true,
		NotificationTypePaymentFailed:      true,
		NotificationTypeSystemUpdate:       true,
	}

	if !validTypes[notificationType] {
		return fmt.Errorf("invalid notification type: %s", notificationType)
	}

	return nil
}

// ValidateNotificationStatus validates notification status
func ValidateNotificationStatus(status NotificationStatus) error {
	validStatuses := map[NotificationStatus]bool{
		NotificationStatusSent:      true,
		NotificationStatusDelivered: true,
		NotificationStatusRead:      true,
		NotificationStatusFailed:    true,
	}

	if !validStatuses[status] {
		return fmt.Errorf("invalid notification status: %s", status)
	}

	return nil
}

// ValidatePhoneNumber validates phone number format
func ValidatePhoneNumber(phone string) error {
	if phone == "" {
		return nil // Optional field
	}

	// Remove spaces, dashes, and parentheses
	cleaned := regexp.MustCompile(`[\s\-\(\)]+`).ReplaceAllString(phone, "")
	
	// Check if it contains only digits and optional + at the beginning
	phoneRegex := regexp.MustCompile(`^\+?[1-9]\d{9,19}$`)
	if !phoneRegex.MatchString(cleaned) {
		return fmt.Errorf("invalid phone number format")
	}

	return nil
}

// ValidateEmail validates email format
func ValidateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email is required")
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

// ValidateMunicipalityCode validates municipality code format
func ValidateMunicipalityCode(code string) error {
	if code == "" {
		return fmt.Errorf("municipality code is required")
	}

	// Code should be alphanumeric, 2-10 characters
	codeRegex := regexp.MustCompile(`^[A-Z0-9]{2,10}$`)
	if !codeRegex.MatchString(strings.ToUpper(code)) {
		return fmt.Errorf("municipality code must be 2-10 alphanumeric characters")
	}

	return nil
}

// ValidateAmount validates payment amount
func ValidateAmount(amount float64) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	if amount > 999999.99 {
		return fmt.Errorf("amount cannot exceed 999,999.99")
	}

	return nil
}

// ValidateQRCodeExpiration validates QR code expiration time
func ValidateQRCodeExpiration(expiresAt time.Time) error {
	now := time.Now()
	
	if expiresAt.Before(now) {
		return fmt.Errorf("QR code expiration time cannot be in the past")
	}

	// Maximum expiration time is 24 hours from now
	maxExpiration := now.Add(24 * time.Hour)
	if expiresAt.After(maxExpiration) {
		return fmt.Errorf("QR code expiration time cannot be more than 24 hours from now")
	}

	return nil
}

// ValidateDueDate validates payment due date
func ValidateDueDate(dueDate *time.Time) error {
	if dueDate == nil {
		return nil // Optional field
	}

	now := time.Now()
	
	// Due date should not be more than 1 year in the past
	oneYearAgo := now.AddDate(-1, 0, 0)
	if dueDate.Before(oneYearAgo) {
		return fmt.Errorf("due date cannot be more than 1 year in the past")
	}

	// Due date should not be more than 5 years in the future
	fiveYearsFromNow := now.AddDate(5, 0, 0)
	if dueDate.After(fiveYearsFromNow) {
		return fmt.Errorf("due date cannot be more than 5 years in the future")
	}

	return nil
}

// RegisterCustomValidators registers custom validation functions with the validator
func RegisterCustomValidators(v *validator.Validate) {
	v.RegisterValidation("phone", func(fl validator.FieldLevel) bool {
		return ValidatePhoneNumber(fl.Field().String()) == nil
	})

	v.RegisterValidation("municipality_code", func(fl validator.FieldLevel) bool {
		return ValidateMunicipalityCode(fl.Field().String()) == nil
	})

	v.RegisterValidation("amount", func(fl validator.FieldLevel) bool {
		return ValidateAmount(fl.Field().Float()) == nil
	})

	v.RegisterValidation("user_role", func(fl validator.FieldLevel) bool {
		return ValidateUserRole(UserRole(fl.Field().String())) == nil
	})

	v.RegisterValidation("service_type", func(fl validator.FieldLevel) bool {
		return ValidateServiceType(ServiceType(fl.Field().String())) == nil
	})

	v.RegisterValidation("payment_status", func(fl validator.FieldLevel) bool {
		return ValidatePaymentStatus(PaymentStatus(fl.Field().String())) == nil
	})

	v.RegisterValidation("currency", func(fl validator.FieldLevel) bool {
		return ValidateCurrency(Currency(fl.Field().String())) == nil
	})

	v.RegisterValidation("notification_type", func(fl validator.FieldLevel) bool {
		return ValidateNotificationType(NotificationType(fl.Field().String())) == nil
	})

	v.RegisterValidation("notification_status", func(fl validator.FieldLevel) bool {
		return ValidateNotificationStatus(NotificationStatus(fl.Field().String())) == nil
	})
}