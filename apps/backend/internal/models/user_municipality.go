package models

import (
	"time"

	"gorm.io/gorm"
)

// UserMunicipality represents the association between users and municipalities
type UserMunicipality struct {
	ID             string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID         string    `json:"userId" gorm:"not null;type:uuid;index:idx_user_municipality_user"`
	MunicipalityID string    `json:"municipalityId" gorm:"not null;type:uuid;index:idx_user_municipality_municipality"`
	CreatedAt      time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	// Relationships
	User         User         `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Municipality Municipality `json:"municipality,omitempty" gorm:"foreignKey:MunicipalityID"`
}

// BeforeCreate hook to validate the association
func (um *UserMunicipality) BeforeCreate(tx *gorm.DB) error {
	// Check if association already exists
	var existing UserMunicipality
	if err := tx.Where("user_id = ? AND municipality_id = ?", um.UserID, um.MunicipalityID).First(&existing).Error; err == nil {
		return gorm.ErrDuplicatedKey
	}
	return nil
}

// TableName returns the table name for the UserMunicipality model
func (UserMunicipality) TableName() string {
	return "user_municipalities"
}