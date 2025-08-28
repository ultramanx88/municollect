package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// PaymentConfig represents the payment configuration for a municipality
type PaymentConfig struct {
	WasteManagementFee      *float64 `json:"wasteManagementFee,omitempty"`
	WaterBillEnabled        *bool    `json:"waterBillEnabled,omitempty"`
	Currency                string   `json:"currency" validate:"required,currency"`
	PaymentMethods          []string `json:"paymentMethods" validate:"required,min=1"`
	QRCodeExpirationMinutes int      `json:"qrCodeExpirationMinutes" validate:"required,min=1,max=1440"`
}

// Value implements the driver.Valuer interface for GORM
func (pc PaymentConfig) Value() (driver.Value, error) {
	return json.Marshal(pc)
}

// Scan implements the sql.Scanner interface for GORM
func (pc *PaymentConfig) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, pc)
}

// Municipality represents a municipality in the system
type Municipality struct {
	ID            string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()" validate:"required"`
	Name          string         `json:"name" gorm:"not null;size:255;index:idx_municipalities_name" validate:"required,min=1,max=255"`
	Code          string         `json:"code" gorm:"uniqueIndex:idx_municipalities_code;not null;size:10" validate:"required,municipality_code"`
	ContactEmail  *string        `json:"contactEmail,omitempty" gorm:"size:255;index:idx_municipalities_contact_email" validate:"omitempty,email"`
	ContactPhone  *string        `json:"contactPhone,omitempty" gorm:"size:20" validate:"omitempty,phone"`
	PaymentConfig *PaymentConfig `json:"paymentConfig,omitempty" gorm:"type:jsonb"`
	CreatedAt     time.Time      `json:"createdAt" gorm:"column:created_at;autoCreateTime;index:idx_municipalities_created_at"`
	UpdatedAt     time.Time      `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:MunicipalityID"`
}

// BeforeCreate hook to validate data before creation
func (m *Municipality) BeforeCreate(tx *gorm.DB) error {
	if m.PaymentConfig != nil && m.PaymentConfig.Currency == "" {
		m.PaymentConfig.Currency = "USD"
	}
	return nil
}

// TableName returns the table name for the Municipality model
func (Municipality) TableName() string {
	return "municipalities"
}