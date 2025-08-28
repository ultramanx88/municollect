package models

import (
	"time"

	"gorm.io/gorm"
)

// ServiceType represents the type of service being paid for
type ServiceType string

const (
	ServiceTypeWasteManagement ServiceType = "waste_management"
	ServiceTypeWaterBill       ServiceType = "water_bill"
)

// PaymentStatus represents the status of a payment
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusExpired   PaymentStatus = "expired"
)

// Currency represents supported currencies
type Currency string

const (
	CurrencyUSD Currency = "USD"
	CurrencyEUR Currency = "EUR"
	CurrencyGBP Currency = "GBP"
)

// Payment represents a payment in the system
type Payment struct {
	ID             string        `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()" validate:"required"`
	MunicipalityID string        `json:"municipalityId" gorm:"column:municipality_id;not null;type:uuid;index:idx_payments_municipality_user,priority:1;index:idx_payments_municipality_service,priority:1" validate:"required,uuid"`
	UserID         string        `json:"userId" gorm:"column:user_id;not null;type:uuid;index:idx_payments_user;index:idx_payments_municipality_user,priority:2" validate:"required,uuid"`
	ServiceType    ServiceType   `json:"serviceType" gorm:"column:service_type;not null;type:varchar(50);index:idx_payments_service_type;index:idx_payments_municipality_service,priority:2" validate:"required,service_type"`
	Amount         float64       `json:"amount" gorm:"not null;type:decimal(10,2);index:idx_payments_amount" validate:"required,amount"`
	Currency       Currency      `json:"currency" gorm:"type:varchar(3);default:USD" validate:"required,currency"`
	Status         PaymentStatus `json:"status" gorm:"type:varchar(20);default:pending;index:idx_payments_status" validate:"required,payment_status"`
	QRCode         *string       `json:"qrCode,omitempty" gorm:"column:qr_code;uniqueIndex:idx_payments_qr_code;size:255"`
	DueDate        *time.Time    `json:"dueDate,omitempty" gorm:"column:due_date;index:idx_payments_due_date"`
	PaidAt         *time.Time    `json:"paidAt,omitempty" gorm:"column:paid_at;index:idx_payments_paid_at"`
	CreatedAt      time.Time     `json:"createdAt" gorm:"column:created_at;autoCreateTime;index:idx_payments_created_at"`
	UpdatedAt      time.Time     `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	Municipality Municipality         `json:"municipality,omitempty" gorm:"foreignKey:MunicipalityID"`
	User         User                 `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Transactions []PaymentTransaction `json:"transactions,omitempty" gorm:"foreignKey:PaymentID"`
}

// PaymentTransaction represents a payment transaction history record
type PaymentTransaction struct {
	ID              string                 `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()" validate:"required"`
	PaymentID       string                 `json:"paymentId" gorm:"column:payment_id;not null;type:uuid;index:idx_payment_transactions_payment_id" validate:"required,uuid"`
	Status          PaymentStatus          `json:"status" gorm:"not null;type:varchar(20);index:idx_payment_transactions_status" validate:"required,payment_status"`
	TransactionData map[string]interface{} `json:"transactionData,omitempty" gorm:"column:transaction_data;type:jsonb"`
	CreatedAt       time.Time              `json:"createdAt" gorm:"column:created_at;autoCreateTime;index:idx_payment_transactions_created_at"`

	// Relationships
	Payment Payment `json:"payment,omitempty" gorm:"foreignKey:PaymentID"`
}

// BeforeCreate hook to set default values
func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.Status == "" {
		p.Status = PaymentStatusPending
	}
	if p.Currency == "" {
		p.Currency = CurrencyUSD
	}
	return nil
}

// TableName returns the table name for the Payment model
func (Payment) TableName() string {
	return "payments"
}

// TableName returns the table name for the PaymentTransaction model
func (PaymentTransaction) TableName() string {
	return "payment_transactions"
}