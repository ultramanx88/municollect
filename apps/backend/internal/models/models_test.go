package models

import (
	"testing"
	"time"
)

// TestModelStructures tests that all models can be instantiated correctly
func TestModelStructures(t *testing.T) {
	// Test User model
	user := User{
		ID:        "test-id",
		Email:     "test@example.com",
		FirstName: "John",
		LastName:  "Doe",
		Role:      UserRoleResident,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if user.Email != "test@example.com" {
		t.Errorf("Expected email to be test@example.com, got %s", user.Email)
	}

	// Test Municipality model
	municipality := Municipality{
		ID:        "test-municipality-id",
		Name:      "Test City",
		Code:      "TC001",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if municipality.Code != "TC001" {
		t.Errorf("Expected code to be TC001, got %s", municipality.Code)
	}

	// Test Payment model
	payment := Payment{
		ID:             "test-payment-id",
		MunicipalityID: municipality.ID,
		UserID:         user.ID,
		ServiceType:    ServiceTypeWasteManagement,
		Amount:         100.50,
		Currency:       CurrencyUSD,
		Status:         PaymentStatusPending,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if payment.Amount != 100.50 {
		t.Errorf("Expected amount to be 100.50, got %f", payment.Amount)
	}

	// Test Notification model
	notification := Notification{
		ID:        "test-notification-id",
		UserID:    user.ID,
		Type:      NotificationTypePaymentReminder,
		Title:     "Payment Reminder",
		Message:   "Your payment is due soon",
		Status:    NotificationStatusSent,
		CreatedAt: time.Now(),
	}

	if notification.Type != NotificationTypePaymentReminder {
		t.Errorf("Expected type to be payment_reminder, got %s", notification.Type)
	}
}

// TestValidationFunctions tests custom validation functions
func TestValidationFunctions(t *testing.T) {
	// Test phone validation
	validPhones := []string{
		"+1234567890",
		"1234567890",
		"+44123456789",
	}

	for _, phone := range validPhones {
		if err := ValidatePhoneNumber(phone); err != nil {
			t.Errorf("Expected phone %s to be valid, got error: %v", phone, err)
		}
	}

	invalidPhones := []string{
		"123",
		"abc123456789",
		"++1234567890",
	}

	for _, phone := range invalidPhones {
		if err := ValidatePhoneNumber(phone); err == nil {
			t.Errorf("Expected phone %s to be invalid, but validation passed", phone)
		}
	}

	// Test email validation
	validEmails := []string{
		"test@example.com",
		"user.name@domain.co.uk",
		"user+tag@example.org",
	}

	for _, email := range validEmails {
		if err := ValidateEmail(email); err != nil {
			t.Errorf("Expected email %s to be valid, got error: %v", email, err)
		}
	}

	invalidEmails := []string{
		"invalid-email",
		"@example.com",
		"user@",
		"",
	}

	for _, email := range invalidEmails {
		if err := ValidateEmail(email); err == nil {
			t.Errorf("Expected email %s to be invalid, but validation passed", email)
		}
	}

	// Test amount validation
	validAmounts := []float64{0.01, 100.50, 999999.99}
	for _, amount := range validAmounts {
		if err := ValidateAmount(amount); err != nil {
			t.Errorf("Expected amount %f to be valid, got error: %v", amount, err)
		}
	}

	invalidAmounts := []float64{0, -10.50, 1000000.00}
	for _, amount := range invalidAmounts {
		if err := ValidateAmount(amount); err == nil {
			t.Errorf("Expected amount %f to be invalid, but validation passed", amount)
		}
	}
}

// TestEnumValidation tests enum validation functions
func TestEnumValidation(t *testing.T) {
	// Test UserRole validation
	validRoles := []UserRole{UserRoleResident, UserRoleMunicipalStaff, UserRoleAdmin}
	for _, role := range validRoles {
		if err := ValidateUserRole(role); err != nil {
			t.Errorf("Expected role %s to be valid, got error: %v", role, err)
		}
	}

	if err := ValidateUserRole("invalid_role"); err == nil {
		t.Error("Expected invalid_role to be invalid, but validation passed")
	}

	// Test ServiceType validation
	validTypes := []ServiceType{ServiceTypeWasteManagement, ServiceTypeWaterBill}
	for _, serviceType := range validTypes {
		if err := ValidateServiceType(serviceType); err != nil {
			t.Errorf("Expected service type %s to be valid, got error: %v", serviceType, err)
		}
	}

	if err := ValidateServiceType("invalid_type"); err == nil {
		t.Error("Expected invalid_type to be invalid, but validation passed")
	}

	// Test Currency validation
	validCurrencies := []Currency{CurrencyUSD, CurrencyEUR, CurrencyGBP}
	for _, currency := range validCurrencies {
		if err := ValidateCurrency(currency); err != nil {
			t.Errorf("Expected currency %s to be valid, got error: %v", currency, err)
		}
	}

	if err := ValidateCurrency("JPY"); err == nil {
		t.Error("Expected JPY to be invalid, but validation passed")
	}
}

// TestPaymentConfigValidation tests payment config validation
func TestPaymentConfigValidation(t *testing.T) {
	validConfig := &PaymentConfig{
		Currency:                "USD",
		PaymentMethods:          []string{"credit_card", "bank_transfer"},
		QRCodeExpirationMinutes: 30,
	}

	if err := ValidatePaymentConfig(validConfig); err != nil {
		t.Errorf("Expected valid config to pass validation, got error: %v", err)
	}

	// Test invalid currency
	invalidConfig := &PaymentConfig{
		Currency:                "INVALID",
		PaymentMethods:          []string{"credit_card"},
		QRCodeExpirationMinutes: 30,
	}

	if err := ValidatePaymentConfig(invalidConfig); err == nil {
		t.Error("Expected invalid currency to fail validation")
	}

	// Test empty payment methods
	invalidConfig2 := &PaymentConfig{
		Currency:                "USD",
		PaymentMethods:          []string{},
		QRCodeExpirationMinutes: 30,
	}

	if err := ValidatePaymentConfig(invalidConfig2); err == nil {
		t.Error("Expected empty payment methods to fail validation")
	}

	// Test invalid expiration time
	invalidConfig3 := &PaymentConfig{
		Currency:                "USD",
		PaymentMethods:          []string{"credit_card"},
		QRCodeExpirationMinutes: 0,
	}

	if err := ValidatePaymentConfig(invalidConfig3); err == nil {
		t.Error("Expected invalid expiration time to fail validation")
	}
}