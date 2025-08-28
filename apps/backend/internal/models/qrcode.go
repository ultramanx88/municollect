package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// QRCodeData represents the data embedded in a QR code
type QRCodeData struct {
	PaymentID      string      `json:"paymentId" validate:"required,uuid"`
	MunicipalityID string      `json:"municipalityId" validate:"required,uuid"`
	Amount         float64     `json:"amount" validate:"required,amount"`
	Currency       Currency    `json:"currency" validate:"required,currency"`
	ServiceType    ServiceType `json:"serviceType" validate:"required,service_type"`
	ExpiresAt      time.Time   `json:"expiresAt" validate:"required"`
}

// Value implements the driver.Valuer interface for GORM
func (qd QRCodeData) Value() (driver.Value, error) {
	return json.Marshal(qd)
}

// Scan implements the sql.Scanner interface for GORM
func (qd *QRCodeData) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, qd)
}

// QRCode represents a QR code in the system
type QRCode struct {
	Code     string     `json:"code" validate:"required"`
	Data     QRCodeData `json:"data" validate:"required"`
	ImageURL *string    `json:"imageUrl,omitempty"`
}

// Note: QRCode is not stored in database as a separate entity
// It's generated on-demand and the code is stored in the Payment model
// This struct is used for API responses and data transfer