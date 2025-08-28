package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/skip2/go-qrcode"
	"gorm.io/gorm"
	"municollect/internal/models"
)

// QRCodeService handles QR code generation and validation
type QRCodeService struct {
	db *gorm.DB
}

// NewQRCodeService creates a new QR code service
func NewQRCodeService(db *gorm.DB) *QRCodeService {
	return &QRCodeService{
		db: db,
	}
}

// QRCodeRequest represents a QR code generation request
type QRCodeRequest struct {
	PaymentID      string                `json:"paymentId" validate:"required,uuid"`
	ExpirationMins int                   `json:"expirationMins,omitempty"` // Default: 60 minutes
	Size           int                   `json:"size,omitempty"`           // Default: 256px
	UserDetails    map[string]interface{} `json:"userDetails,omitempty"`
}

// GenerateQRCode generates a QR code for a payment
func (s *QRCodeService) GenerateQRCode(req *QRCodeRequest) (*models.QRCode, error) {
	// Get payment details
	var payment models.Payment
	if err := s.db.Preload("Municipality").Preload("User").First(&payment, "id = ?", req.PaymentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("payment with ID '%s' not found", req.PaymentID)
		}
		return nil, fmt.Errorf("failed to get payment: %w", err)
	}

	// Check if payment is in a valid state for QR code generation
	if payment.Status != models.PaymentStatusPending {
		return nil, fmt.Errorf("cannot generate QR code for payment with status '%s'", payment.Status)
	}

	// Set default expiration if not provided
	expirationMins := req.ExpirationMins
	if expirationMins <= 0 {
		// Use municipality config if available, otherwise default to 60 minutes
		if payment.Municipality.PaymentConfig != nil && payment.Municipality.PaymentConfig.QRCodeExpirationMinutes > 0 {
			expirationMins = payment.Municipality.PaymentConfig.QRCodeExpirationMinutes
		} else {
			expirationMins = 60
		}
	}

	// Generate unique QR code string
	qrCodeString, err := s.generateUniqueQRCodeString()
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code string: %w", err)
	}

	// Create QR code data
	expiresAt := time.Now().Add(time.Duration(expirationMins) * time.Minute)
	qrData := models.QRCodeData{
		PaymentID:      payment.ID,
		MunicipalityID: payment.MunicipalityID,
		Amount:         payment.Amount,
		Currency:       payment.Currency,
		ServiceType:    payment.ServiceType,
		ExpiresAt:      expiresAt,
	}

	// Generate QR code image
	size := req.Size
	if size <= 0 {
		size = 256
	}

	// Create the data to encode in QR code (JSON format)
	qrDataJSON, err := json.Marshal(qrData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal QR data: %w", err)
	}

	// Generate QR code image
	qrCodeImage, err := qrcode.Encode(string(qrDataJSON), qrcode.Medium, size)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code image: %w", err)
	}

	// Convert image to base64 for easy transmission
	imageBase64 := base64.StdEncoding.EncodeToString(qrCodeImage)
	imageURL := fmt.Sprintf("data:image/png;base64,%s", imageBase64)

	// Update payment with QR code
	if err := s.db.Model(&payment).Update("qr_code", qrCodeString).Error; err != nil {
		return nil, fmt.Errorf("failed to update payment with QR code: %w", err)
	}

	// Create QR code response
	qrCode := &models.QRCode{
		Code:     qrCodeString,
		Data:     qrData,
		ImageURL: &imageURL,
	}

	return qrCode, nil
}

// ValidateQRCode validates a QR code and returns the associated payment data
func (s *QRCodeService) ValidateQRCode(qrCodeString string) (*models.Payment, error) {
	// Find payment by QR code
	var payment models.Payment
	if err := s.db.Preload("Municipality").Preload("User").Where("qr_code = ?", qrCodeString).First(&payment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("invalid QR code")
		}
		return nil, fmt.Errorf("failed to validate QR code: %w", err)
	}

	// Check if payment is still valid
	if payment.Status != models.PaymentStatusPending {
		return nil, fmt.Errorf("QR code is no longer valid - payment status: %s", payment.Status)
	}

	// Check expiration based on municipality config
	expirationMins := 60 // default
	if payment.Municipality.PaymentConfig != nil && payment.Municipality.PaymentConfig.QRCodeExpirationMinutes > 0 {
		expirationMins = payment.Municipality.PaymentConfig.QRCodeExpirationMinutes
	}

	expirationTime := payment.CreatedAt.Add(time.Duration(expirationMins) * time.Minute)
	if time.Now().After(expirationTime) {
		// Mark payment as expired
		s.db.Model(&payment).Update("status", models.PaymentStatusExpired)
		return nil, fmt.Errorf("QR code has expired")
	}

	return &payment, nil
}

// GetQRCodeDetails retrieves QR code details by code string
func (s *QRCodeService) GetQRCodeDetails(qrCodeString string) (*models.QRCode, error) {
	// Validate QR code first
	payment, err := s.ValidateQRCode(qrCodeString)
	if err != nil {
		return nil, err
	}

	// Create QR code data
	qrData := models.QRCodeData{
		PaymentID:      payment.ID,
		MunicipalityID: payment.MunicipalityID,
		Amount:         payment.Amount,
		Currency:       payment.Currency,
		ServiceType:    payment.ServiceType,
		ExpiresAt:      payment.CreatedAt.Add(60 * time.Minute), // Default expiration
	}

	// Update expiration based on municipality config
	if payment.Municipality.PaymentConfig != nil && payment.Municipality.PaymentConfig.QRCodeExpirationMinutes > 0 {
		qrData.ExpiresAt = payment.CreatedAt.Add(time.Duration(payment.Municipality.PaymentConfig.QRCodeExpirationMinutes) * time.Minute)
	}

	qrCode := &models.QRCode{
		Code: qrCodeString,
		Data: qrData,
		// ImageURL is not included in details response for performance
	}

	return qrCode, nil
}

// RegenerateQRCode regenerates a QR code for an existing payment
func (s *QRCodeService) RegenerateQRCode(paymentID string, req *QRCodeRequest) (*models.QRCode, error) {
	// Check if payment exists and is in valid state
	var payment models.Payment
	if err := s.db.First(&payment, "id = ?", paymentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("payment with ID '%s' not found", paymentID)
		}
		return nil, fmt.Errorf("failed to get payment: %w", err)
	}

	if payment.Status != models.PaymentStatusPending {
		return nil, fmt.Errorf("cannot regenerate QR code for payment with status '%s'", payment.Status)
	}

	// Set payment ID in request
	req.PaymentID = paymentID

	// Generate new QR code
	return s.GenerateQRCode(req)
}

// ExpireQRCodes marks expired QR codes as expired
func (s *QRCodeService) ExpireQRCodes() error {
	// This would typically be called by a scheduled job
	// For now, we'll expire QR codes older than 24 hours
	expirationTime := time.Now().Add(-24 * time.Hour)

	result := s.db.Model(&models.Payment{}).
		Where("status = ? AND qr_code IS NOT NULL AND created_at < ?", models.PaymentStatusPending, expirationTime).
		Update("status", models.PaymentStatusExpired)

	if result.Error != nil {
		return fmt.Errorf("failed to expire QR codes: %w", result.Error)
	}

	return nil
}

// generateUniqueQRCodeString generates a unique QR code string
func (s *QRCodeService) generateUniqueQRCodeString() (string, error) {
	const maxAttempts = 10

	for i := 0; i < maxAttempts; i++ {
		// Generate random bytes
		bytes := make([]byte, 16)
		if _, err := rand.Read(bytes); err != nil {
			return "", fmt.Errorf("failed to generate random bytes: %w", err)
		}

		// Encode to base64 and make URL-safe
		qrCodeString := base64.URLEncoding.EncodeToString(bytes)

		// Check if this QR code already exists
		var count int64
		if err := s.db.Model(&models.Payment{}).Where("qr_code = ?", qrCodeString).Count(&count).Error; err != nil {
			return "", fmt.Errorf("failed to check QR code uniqueness: %w", err)
		}

		if count == 0 {
			return qrCodeString, nil
		}
	}

	return "", fmt.Errorf("failed to generate unique QR code after %d attempts", maxAttempts)
}