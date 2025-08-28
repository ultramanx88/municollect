package services

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
	"municollect/internal/models"
)

// PaymentService handles payment-related business logic
type PaymentService struct {
	db *gorm.DB
}

// NewPaymentService creates a new payment service
func NewPaymentService(db *gorm.DB) *PaymentService {
	return &PaymentService{
		db: db,
	}
}

// PaymentRequest represents a payment creation request
type PaymentRequest struct {
	MunicipalityID string                `json:"municipalityId" validate:"required,uuid"`
	ServiceType    models.ServiceType    `json:"serviceType" validate:"required"`
	Amount         float64               `json:"amount" validate:"required,gt=0"`
	Currency       models.Currency       `json:"currency,omitempty"`
	DueDate        *time.Time            `json:"dueDate,omitempty"`
	UserDetails    map[string]interface{} `json:"userDetails,omitempty"`
}

// PaymentFilter represents filters for payment queries
type PaymentFilter struct {
	MunicipalityID *string                `json:"municipalityId,omitempty"`
	UserID         *string                `json:"userId,omitempty"`
	ServiceType    *models.ServiceType    `json:"serviceType,omitempty"`
	Status         *models.PaymentStatus  `json:"status,omitempty"`
	DateFrom       *time.Time             `json:"dateFrom,omitempty"`
	DateTo         *time.Time             `json:"dateTo,omitempty"`
}

// CreatePayment creates a new payment
func (s *PaymentService) CreatePayment(userID string, req *PaymentRequest) (*models.Payment, error) {
	// Validate municipality exists
	var municipality models.Municipality
	if err := s.db.First(&municipality, "id = ?", req.MunicipalityID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("municipality with ID '%s' not found", req.MunicipalityID)
		}
		return nil, fmt.Errorf("failed to validate municipality: %w", err)
	}

	// Validate user exists
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user with ID '%s' not found", userID)
		}
		return nil, fmt.Errorf("failed to validate user: %w", err)
	}

	// Set default currency if not provided
	currency := req.Currency
	if currency == "" {
		if municipality.PaymentConfig != nil && municipality.PaymentConfig.Currency != "" {
			currency = models.Currency(municipality.PaymentConfig.Currency)
		} else {
			currency = models.CurrencyUSD
		}
	}

	// Create payment
	payment := &models.Payment{
		MunicipalityID: req.MunicipalityID,
		UserID:         userID,
		ServiceType:    req.ServiceType,
		Amount:         req.Amount,
		Currency:       currency,
		Status:         models.PaymentStatusPending,
		DueDate:        req.DueDate,
	}

	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create payment record
	if err := tx.Create(payment).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create payment: %w", err)
	}

	// Create initial transaction record
	transaction := &models.PaymentTransaction{
		PaymentID:       payment.ID,
		Status:          models.PaymentStatusPending,
		TransactionData: req.UserDetails,
	}

	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create payment transaction: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit payment creation: %w", err)
	}

	// Load relationships
	if err := s.db.Preload("Municipality").Preload("User").First(payment, "id = ?", payment.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load payment relationships: %w", err)
	}

	return payment, nil
}

// GetPaymentByID retrieves a payment by ID
func (s *PaymentService) GetPaymentByID(paymentID string, userID *string) (*models.Payment, error) {
	var payment models.Payment
	query := s.db.Preload("Municipality").Preload("User").Preload("Transactions")

	// If userID is provided, ensure the payment belongs to the user
	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}

	if err := query.First(&payment, "id = ?", paymentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("payment with ID '%s' not found", paymentID)
		}
		return nil, fmt.Errorf("failed to get payment: %w", err)
	}

	return &payment, nil
}

// GetPaymentHistory retrieves payment history with filtering and pagination
func (s *PaymentService) GetPaymentHistory(filter *PaymentFilter, limit, offset int) ([]models.Payment, int64, error) {
	var payments []models.Payment
	var total int64

	query := s.db.Model(&models.Payment{}).Preload("Municipality").Preload("User")

	// Apply filters
	if filter.MunicipalityID != nil {
		query = query.Where("municipality_id = ?", *filter.MunicipalityID)
	}
	if filter.UserID != nil {
		query = query.Where("user_id = ?", *filter.UserID)
	}
	if filter.ServiceType != nil {
		query = query.Where("service_type = ?", *filter.ServiceType)
	}
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}
	if filter.DateFrom != nil {
		query = query.Where("created_at >= ?", *filter.DateFrom)
	}
	if filter.DateTo != nil {
		query = query.Where("created_at <= ?", *filter.DateTo)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count payments: %w", err)
	}

	// Get payments with pagination
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Order("created_at DESC").Find(&payments).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get payment history: %w", err)
	}

	return payments, total, nil
}

// UpdatePaymentStatus updates the status of a payment
func (s *PaymentService) UpdatePaymentStatus(paymentID string, status models.PaymentStatus, transactionData map[string]interface{}) (*models.Payment, error) {
	// Get payment
	payment, err := s.GetPaymentByID(paymentID, nil)
	if err != nil {
		return nil, err
	}

	// Validate status transition
	if !s.isValidStatusTransition(payment.Status, status) {
		return nil, fmt.Errorf("invalid status transition from %s to %s", payment.Status, status)
	}

	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Update payment status
	updates := map[string]interface{}{
		"status": status,
	}

	// Set paid_at timestamp if payment is completed
	if status == models.PaymentStatusCompleted {
		now := time.Now()
		updates["paid_at"] = &now
	}

	if err := tx.Model(payment).Updates(updates).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update payment status: %w", err)
	}

	// Create transaction record
	transaction := &models.PaymentTransaction{
		PaymentID:       paymentID,
		Status:          status,
		TransactionData: transactionData,
	}

	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create payment transaction: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit payment status update: %w", err)
	}

	// Reload payment with updated data
	if err := s.db.Preload("Municipality").Preload("User").Preload("Transactions").First(payment, "id = ?", paymentID).Error; err != nil {
		return nil, fmt.Errorf("failed to reload payment: %w", err)
	}

	return payment, nil
}

// GetPaymentsByUser retrieves all payments for a specific user
func (s *PaymentService) GetPaymentsByUser(userID string, limit, offset int) ([]models.Payment, int64, error) {
	filter := &PaymentFilter{
		UserID: &userID,
	}
	return s.GetPaymentHistory(filter, limit, offset)
}

// GetPaymentsByMunicipality retrieves all payments for a specific municipality
func (s *PaymentService) GetPaymentsByMunicipality(municipalityID string, limit, offset int) ([]models.Payment, int64, error) {
	filter := &PaymentFilter{
		MunicipalityID: &municipalityID,
	}
	return s.GetPaymentHistory(filter, limit, offset)
}

// ExpireOldPayments marks old pending payments as expired
func (s *PaymentService) ExpireOldPayments() error {
	// Get expiration time (24 hours ago by default)
	expirationTime := time.Now().Add(-24 * time.Hour)

	// Update expired payments
	result := s.db.Model(&models.Payment{}).
		Where("status = ? AND created_at < ?", models.PaymentStatusPending, expirationTime).
		Update("status", models.PaymentStatusExpired)

	if result.Error != nil {
		return fmt.Errorf("failed to expire old payments: %w", result.Error)
	}

	return nil
}

// isValidStatusTransition checks if a status transition is valid
func (s *PaymentService) isValidStatusTransition(from, to models.PaymentStatus) bool {
	validTransitions := map[models.PaymentStatus][]models.PaymentStatus{
		models.PaymentStatusPending: {
			models.PaymentStatusCompleted,
			models.PaymentStatusFailed,
			models.PaymentStatusExpired,
		},
		models.PaymentStatusFailed: {
			models.PaymentStatusPending,
			models.PaymentStatusExpired,
		},
		models.PaymentStatusCompleted: {}, // No transitions from completed
		models.PaymentStatusExpired: {
			models.PaymentStatusPending,
		},
	}

	allowedTransitions, exists := validTransitions[from]
	if !exists {
		return false
	}

	for _, allowed := range allowedTransitions {
		if allowed == to {
			return true
		}
	}

	return false
}