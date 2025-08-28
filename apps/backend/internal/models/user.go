package models

import (
	"time"

	"gorm.io/gorm"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	UserRoleResident       UserRole = "resident"
	UserRoleMunicipalStaff UserRole = "municipal_staff"
	UserRoleAdmin          UserRole = "admin"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()" validate:"required"`
	Email     string    `json:"email" gorm:"uniqueIndex:idx_users_email;not null;size:255" validate:"required,email"`
	FirstName string    `json:"firstName" gorm:"column:first_name;not null;size:100;index:idx_users_name" validate:"required,min=1,max=100"`
	LastName  string    `json:"lastName" gorm:"column:last_name;not null;size:100;index:idx_users_name" validate:"required,min=1,max=100"`
	Phone     *string   `json:"phone,omitempty" gorm:"size:20;index:idx_users_phone" validate:"omitempty,phone"`
	Role      UserRole  `json:"role" gorm:"type:varchar(20);default:resident;index:idx_users_role" validate:"required,user_role"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime;index:idx_users_created_at"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	Payments      []Payment      `json:"payments,omitempty" gorm:"foreignKey:UserID"`
	Notifications []Notification `json:"notifications,omitempty" gorm:"foreignKey:UserID"`
}

// UserDetails represents user details for forms and requests
type UserDetails struct {
	FirstName string  `json:"firstName" validate:"required,min=1,max=100"`
	LastName  string  `json:"lastName" validate:"required,min=1,max=100"`
	Email     string  `json:"email" validate:"required,email"`
	Phone     *string `json:"phone,omitempty" validate:"omitempty,phone"`
}

// BeforeCreate hook to set default values
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "" {
		u.Role = UserRoleResident
	}
	return nil
}

// TableName returns the table name for the User model
func (User) TableName() string {
	return "users"
}