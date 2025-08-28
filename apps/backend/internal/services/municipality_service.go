package services

import (
	"errors"
	"fmt"

	"gorm.io/gorm"
	"municollect/internal/models"
)

// MunicipalityService handles municipality-related business logic
type MunicipalityService struct {
	db *gorm.DB
}

// NewMunicipalityService creates a new municipality service
func NewMunicipalityService(db *gorm.DB) *MunicipalityService {
	return &MunicipalityService{
		db: db,
	}
}

// CreateMunicipality creates a new municipality
func (s *MunicipalityService) CreateMunicipality(municipality *models.Municipality) error {
	// Validate required fields
	if municipality.Name == "" {
		return errors.New("municipality name is required")
	}
	if municipality.Code == "" {
		return errors.New("municipality code is required")
	}

	// Check if municipality code already exists
	var existing models.Municipality
	if err := s.db.Where("code = ?", municipality.Code).First(&existing).Error; err == nil {
		return fmt.Errorf("municipality with code '%s' already exists", municipality.Code)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("error checking municipality code: %w", err)
	}

	// Set default payment config if not provided
	if municipality.PaymentConfig == nil {
		municipality.PaymentConfig = &models.PaymentConfig{
			Currency:                "USD",
			PaymentMethods:          []string{"qr_code"},
			QRCodeExpirationMinutes: 60,
		}
	}

	if err := s.db.Create(municipality).Error; err != nil {
		return fmt.Errorf("failed to create municipality: %w", err)
	}

	return nil
}

// GetMunicipalityByID retrieves a municipality by ID
func (s *MunicipalityService) GetMunicipalityByID(id string) (*models.Municipality, error) {
	var municipality models.Municipality
	if err := s.db.First(&municipality, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("municipality with ID '%s' not found", id)
		}
		return nil, fmt.Errorf("failed to get municipality: %w", err)
	}
	return &municipality, nil
}

// GetMunicipalityByCode retrieves a municipality by code
func (s *MunicipalityService) GetMunicipalityByCode(code string) (*models.Municipality, error) {
	var municipality models.Municipality
	if err := s.db.Where("code = ?", code).First(&municipality).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("municipality with code '%s' not found", code)
		}
		return nil, fmt.Errorf("failed to get municipality: %w", err)
	}
	return &municipality, nil
}

// GetAllMunicipalities retrieves all municipalities with optional pagination
func (s *MunicipalityService) GetAllMunicipalities(limit, offset int) ([]models.Municipality, int64, error) {
	var municipalities []models.Municipality
	var total int64

	// Get total count
	if err := s.db.Model(&models.Municipality{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count municipalities: %w", err)
	}

	// Get municipalities with pagination
	query := s.db.Order("name ASC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&municipalities).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get municipalities: %w", err)
	}

	return municipalities, total, nil
}

// UpdateMunicipality updates an existing municipality
func (s *MunicipalityService) UpdateMunicipality(id string, updates *models.Municipality) (*models.Municipality, error) {
	// Check if municipality exists
	municipality, err := s.GetMunicipalityByID(id)
	if err != nil {
		return nil, err
	}

	// If code is being updated, check for conflicts
	if updates.Code != "" && updates.Code != municipality.Code {
		var existing models.Municipality
		if err := s.db.Where("code = ? AND id != ?", updates.Code, id).First(&existing).Error; err == nil {
			return nil, fmt.Errorf("municipality with code '%s' already exists", updates.Code)
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("error checking municipality code: %w", err)
		}
	}

	// Update fields
	if updates.Name != "" {
		municipality.Name = updates.Name
	}
	if updates.Code != "" {
		municipality.Code = updates.Code
	}
	if updates.ContactEmail != nil {
		municipality.ContactEmail = updates.ContactEmail
	}
	if updates.ContactPhone != nil {
		municipality.ContactPhone = updates.ContactPhone
	}
	if updates.PaymentConfig != nil {
		municipality.PaymentConfig = updates.PaymentConfig
	}

	if err := s.db.Save(municipality).Error; err != nil {
		return nil, fmt.Errorf("failed to update municipality: %w", err)
	}

	return municipality, nil
}

// DeleteMunicipality deletes a municipality by ID
func (s *MunicipalityService) DeleteMunicipality(id string) error {
	// Check if municipality exists
	_, err := s.GetMunicipalityByID(id)
	if err != nil {
		return err
	}

	// Check if municipality has associated payments
	var paymentCount int64
	if err := s.db.Model(&models.Payment{}).Where("municipality_id = ?", id).Count(&paymentCount).Error; err != nil {
		return fmt.Errorf("failed to check for associated payments: %w", err)
	}

	if paymentCount > 0 {
		return fmt.Errorf("cannot delete municipality with existing payments")
	}

	if err := s.db.Delete(&models.Municipality{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete municipality: %w", err)
	}

	return nil
}

// SearchMunicipalities searches municipalities by name or code
func (s *MunicipalityService) SearchMunicipalities(query string, limit, offset int) ([]models.Municipality, int64, error) {
	var municipalities []models.Municipality
	var total int64

	searchQuery := "%" + query + "%"
	dbQuery := s.db.Model(&models.Municipality{}).Where("name ILIKE ? OR code ILIKE ?", searchQuery, searchQuery)

	// Get total count
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count municipalities: %w", err)
	}

	// Get municipalities with pagination
	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("name ASC").Find(&municipalities).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to search municipalities: %w", err)
	}

	return municipalities, total, nil
}