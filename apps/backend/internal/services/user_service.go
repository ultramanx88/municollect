package services

import (
	"errors"
	"fmt"

	"gorm.io/gorm"
	"municollect/internal/models"
)

// UserService handles user-related business logic
type UserService struct {
	db *gorm.DB
}

// NewUserService creates a new user service
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db: db,
	}
}

// GetUserByID retrieves a user by their ID
func (s *UserService) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by their email
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// UpdateUserProfile updates a user's profile information
func (s *UserService) UpdateUserProfile(userID string, updates models.UserDetails) (*models.User, error) {
	var user models.User
	
	// Get existing user
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	// Update fields
	user.FirstName = updates.FirstName
	user.LastName = updates.LastName
	user.Email = updates.Email
	user.Phone = updates.Phone
	
	// Save changes
	if err := s.db.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}
	
	return &user, nil
}

// GetUserMunicipalities retrieves municipalities associated with a user
func (s *UserService) GetUserMunicipalities(userID string) ([]models.Municipality, error) {
	var municipalities []models.Municipality
	
	// Get municipalities through the user_municipalities association table
	err := s.db.Table("municipalities").
		Joins("INNER JOIN user_municipalities ON municipalities.id = user_municipalities.municipality_id").
		Where("user_municipalities.user_id = ?", userID).
		Find(&municipalities).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get user municipalities: %w", err)
	}
	
	return municipalities, nil
}

// AssociateUserWithMunicipality associates a user with a municipality
func (s *UserService) AssociateUserWithMunicipality(userID, municipalityID string) error {
	// Verify user exists
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to get user: %w", err)
	}
	
	// Verify municipality exists
	var municipality models.Municipality
	if err := s.db.Where("id = ?", municipalityID).First(&municipality).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("municipality not found")
		}
		return fmt.Errorf("failed to get municipality: %w", err)
	}
	
	// Check if association already exists
	var existingAssociation models.UserMunicipality
	if err := s.db.Where("user_id = ? AND municipality_id = ?", userID, municipalityID).First(&existingAssociation).Error; err == nil {
		// Association already exists, return success
		return nil
	}
	
	// Create new association
	association := models.UserMunicipality{
		UserID:         userID,
		MunicipalityID: municipalityID,
	}
	
	if err := s.db.Create(&association).Error; err != nil {
		return fmt.Errorf("failed to create municipality association: %w", err)
	}
	
	return nil
}

// RemoveUserMunicipalityAssociation removes association between user and municipality
func (s *UserService) RemoveUserMunicipalityAssociation(userID, municipalityID string) error {
	// Verify user exists
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to get user: %w", err)
	}
	
	// Remove the association
	result := s.db.Where("user_id = ? AND municipality_id = ?", userID, municipalityID).Delete(&models.UserMunicipality{})
	if result.Error != nil {
		return fmt.Errorf("failed to remove municipality association: %w", result.Error)
	}
	
	// Check if any association was actually deleted
	if result.RowsAffected == 0 {
		return fmt.Errorf("municipality association not found")
	}
	
	return nil
}