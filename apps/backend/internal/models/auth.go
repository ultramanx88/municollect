package models

import (
	"time"

	"gorm.io/gorm"
)

// Auth represents user authentication data stored in database
type Auth struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID       string    `json:"userId" gorm:"uniqueIndex:idx_auth_user_id;not null;type:uuid"`
	PasswordHash string    `json:"-" gorm:"column:password_hash;not null;size:255"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID;references:ID"`
}

// BeforeCreate hook for Auth model
func (a *Auth) BeforeCreate(tx *gorm.DB) error {
	return nil
}

// TableName returns the table name for the Auth model
func (Auth) TableName() string {
	return "auth"
}

// AuthTokens represents authentication tokens (not stored in database)
type AuthTokens struct {
	AccessToken  string    `json:"accessToken" validate:"required"`
	RefreshToken string    `json:"refreshToken" validate:"required"`
	ExpiresAt    time.Time `json:"expiresAt" validate:"required"`
}

// UserSession represents a user session with tokens (not stored in database)
type UserSession struct {
	User   User       `json:"user" validate:"required"`
	Tokens AuthTokens `json:"tokens" validate:"required"`
}

// Note: AuthTokens and UserSession are not stored in database
// They are used for API responses and data transfer
// Actual token storage would be handled by JWT or session store