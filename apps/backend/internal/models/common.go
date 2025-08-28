package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// BaseEntity represents common fields for all entities
type BaseEntity struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

// PaginationParams represents pagination parameters
type PaginationParams struct {
	Limit  *int `json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset *int `json:"offset,omitempty" validate:"omitempty,min=0"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse[T any] struct {
	Data    []T  `json:"data"`
	Total   int  `json:"total"`
	HasMore bool `json:"hasMore"`
	Limit   int  `json:"limit"`
	Offset  int  `json:"offset"`
}

// SortDirection represents sort direction
type SortDirection string

const (
	SortDirectionAsc  SortDirection = "asc"
	SortDirectionDesc SortDirection = "desc"
)

// SortParams represents sorting parameters
type SortParams struct {
	Field     string        `json:"field" validate:"required"`
	Direction SortDirection `json:"direction" validate:"required,oneof=asc desc"`
}

// FilterParams represents filtering parameters
type FilterParams map[string]interface{}

// Value implements the driver.Valuer interface for GORM
func (fp FilterParams) Value() (driver.Value, error) {
	if fp == nil {
		return nil, nil
	}
	return json.Marshal(fp)
}

// Scan implements the sql.Scanner interface for GORM
func (fp *FilterParams) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, fp)
}

// SearchParams represents search parameters
type SearchParams struct {
	Query   *string       `json:"query,omitempty"`
	Filters *FilterParams `json:"filters,omitempty"`
	Sort    *SortParams   `json:"sort,omitempty"`
	Limit   *int          `json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset  *int          `json:"offset,omitempty" validate:"omitempty,min=0"`
}

// DatabaseConfig represents database configuration
type DatabaseConfig struct {
	Host     string `json:"host" validate:"required"`
	Port     int    `json:"port" validate:"required,min=1,max=65535"`
	Database string `json:"database" validate:"required"`
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
	SSL      *bool  `json:"ssl,omitempty"`
}

// FirebaseConfig represents Firebase configuration
type FirebaseConfig struct {
	ProjectID   string `json:"projectId" validate:"required"`
	PrivateKey  string `json:"privateKey" validate:"required"`
	ClientEmail string `json:"clientEmail" validate:"required,email"`
}

// Environment represents application environment
type Environment string

const (
	EnvironmentDevelopment Environment = "development"
	EnvironmentStaging     Environment = "staging"
	EnvironmentProduction  Environment = "production"
)

// AppConfig represents application configuration
type AppConfig struct {
	Port        int            `json:"port" validate:"required,min=1,max=65535"`
	Environment Environment    `json:"environment" validate:"required,oneof=development staging production"`
	Database    DatabaseConfig `json:"database" validate:"required"`
	Firebase    FirebaseConfig `json:"firebase" validate:"required"`
	JWTSecret   string         `json:"jwtSecret" validate:"required,min=32"`
	CORSOrigins []string       `json:"corsOrigins" validate:"required,min=1"`
}

// SuccessResponse represents a successful API response
type SuccessResponse[T any] struct {
	Success   bool  `json:"success"`
	Data      T     `json:"data"`
	Timestamp int64 `json:"timestamp"`
}

// ErrorDetails represents error details
type ErrorDetails struct {
	Message string      `json:"message"`
	Code    string      `json:"code"`
	Details interface{} `json:"details,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success   bool         `json:"success"`
	Error     ErrorDetails `json:"error"`
	Timestamp int64        `json:"timestamp"`
}

// NewSuccessResponse creates a new success response
func NewSuccessResponse[T any](data T) SuccessResponse[T] {
	return SuccessResponse[T]{
		Success:   true,
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}

// NewErrorResponse creates a new error response
func NewErrorResponse(message, code string, details interface{}) ErrorResponse {
	return ErrorResponse{
		Success: false,
		Error: ErrorDetails{
			Message: message,
			Code:    code,
			Details: details,
		},
		Timestamp: time.Now().Unix(),
	}
}