package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypePaymentReminder    NotificationType = "payment_reminder"
	NotificationTypePaymentConfirmation NotificationType = "payment_confirmation"
	NotificationTypePaymentFailed      NotificationType = "payment_failed"
	NotificationTypeSystemUpdate       NotificationType = "system_update"
)

// NotificationStatus represents the status of a notification
type NotificationStatus string

const (
	NotificationStatusSent      NotificationStatus = "sent"
	NotificationStatusDelivered NotificationStatus = "delivered"
	NotificationStatusRead      NotificationStatus = "read"
	NotificationStatusFailed    NotificationStatus = "failed"
)

// NotificationData represents additional data for notifications
type NotificationData map[string]interface{}

// Value implements the driver.Valuer interface for GORM
func (nd NotificationData) Value() (driver.Value, error) {
	if nd == nil {
		return nil, nil
	}
	return json.Marshal(nd)
}

// Scan implements the sql.Scanner interface for GORM
func (nd *NotificationData) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, nd)
}

// Notification represents a notification in the system
type Notification struct {
	ID        string             `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()" validate:"required"`
	UserID    string             `json:"userId" gorm:"column:user_id;not null;type:uuid;index:idx_notifications_user_id;index:idx_notifications_user_status,priority:1" validate:"required,uuid"`
	Type      NotificationType   `json:"type" gorm:"not null;type:varchar(50);index:idx_notifications_type" validate:"required,notification_type"`
	Title     string             `json:"title" gorm:"not null;size:255" validate:"required,min=1,max=255"`
	Message   string             `json:"message" gorm:"not null;type:text" validate:"required,min=1"`
	Status    NotificationStatus `json:"status" gorm:"type:varchar(20);default:sent;index:idx_notifications_status;index:idx_notifications_user_status,priority:2" validate:"required,notification_status"`
	Data      NotificationData   `json:"data,omitempty" gorm:"type:jsonb"`
	CreatedAt time.Time          `json:"createdAt" gorm:"column:created_at;autoCreateTime;index:idx_notifications_created_at"`
	ReadAt    *time.Time         `json:"readAt,omitempty" gorm:"column:read_at;index:idx_notifications_read_at"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook to set default values
func (n *Notification) BeforeCreate(tx *gorm.DB) error {
	if n.Status == "" {
		n.Status = NotificationStatusSent
	}
	return nil
}

// MarkAsRead marks the notification as read
func (n *Notification) MarkAsRead() {
	now := time.Now()
	n.Status = NotificationStatusRead
	n.ReadAt = &now
}

// TableName returns the table name for the Notification model
func (Notification) TableName() string {
	return "notifications"
}