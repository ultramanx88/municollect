package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"

	"municollect/internal/models"
)

// MockMunicipalityService is a mock implementation of MunicipalityService
type MockMunicipalityService struct {
	mock.Mock
}

func (m *MockMunicipalityService) CreateMunicipality(municipality *models.Municipality) error {
	args := m.Called(municipality)
	return args.Error(0)
}

func (m *MockMunicipalityService) GetMunicipalityByID(id string) (*models.Municipality, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Municipality), args.Error(1)
}

func (m *MockMunicipalityService) GetMunicipalityByCode(code string) (*models.Municipality, error) {
	args := m.Called(code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Municipality), args.Error(1)
}

func (m *MockMunicipalityService) GetAllMunicipalities(limit, offset int) ([]models.Municipality, int64, error) {
	args := m.Called(limit, offset)
	return args.Get(0).([]models.Municipality), args.Get(1).(int64), args.Error(2)
}

func (m *MockMunicipalityService) UpdateMunicipality(id string, updates *models.Municipality) (*models.Municipality, error) {
	args := m.Called(id, updates)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Municipality), args.Error(1)
}

func (m *MockMunicipalityService) DeleteMunicipality(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockMunicipalityService) SearchMunicipalities(query string, limit, offset int) ([]models.Municipality, int64, error) {
	args := m.Called(query, limit, offset)
	return args.Get(0).([]models.Municipality), args.Get(1).(int64), args.Error(2)
}

func TestMunicipalityHandler_CreateMunicipality(t *testing.T) {
	app := fiber.New()
	mockService := new(MockMunicipalityService)
	handler := &MunicipalityHandler{municipalityService: mockService}

	app.Post("/municipalities", handler.CreateMunicipality)

	t.Run("successful creation", func(t *testing.T) {
		municipality := models.Municipality{
			Name: "Test City",
			Code: "TC001",
		}

		mockService.On("CreateMunicipality", mock.AnythingOfType("*models.Municipality")).Return(nil).Once()

		body, _ := json.Marshal(municipality)
		req := httptest.NewRequest("POST", "/municipalities", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("invalid request body", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/municipalities", bytes.NewReader([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("municipality already exists", func(t *testing.T) {
		municipality := models.Municipality{
			Name: "Test City",
			Code: "TC001",
		}

		mockService.On("CreateMunicipality", mock.AnythingOfType("*models.Municipality")).
			Return(gorm.ErrDuplicatedKey).Once()

		body, _ := json.Marshal(municipality)
		req := httptest.NewRequest("POST", "/municipalities", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestMunicipalityHandler_GetMunicipality(t *testing.T) {
	app := fiber.New()
	mockService := new(MockMunicipalityService)
	handler := &MunicipalityHandler{municipalityService: mockService}

	app.Get("/municipalities/:id", handler.GetMunicipality)

	t.Run("successful retrieval", func(t *testing.T) {
		municipality := &models.Municipality{
			ID:   "test-id",
			Name: "Test City",
			Code: "TC001",
		}

		mockService.On("GetMunicipalityByID", "test-id").Return(municipality, nil).Once()

		req := httptest.NewRequest("GET", "/municipalities/test-id", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("municipality not found", func(t *testing.T) {
		mockService.On("GetMunicipalityByID", "non-existent").
			Return(nil, gorm.ErrRecordNotFound).Once()

		req := httptest.NewRequest("GET", "/municipalities/non-existent", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("missing municipality ID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/municipalities/", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode) // Fiber returns 404 for missing params
	})
}

func TestMunicipalityHandler_GetMunicipalities(t *testing.T) {
	app := fiber.New()
	mockService := new(MockMunicipalityService)
	handler := &MunicipalityHandler{municipalityService: mockService}

	app.Get("/municipalities", handler.GetMunicipalities)

	t.Run("successful retrieval with default pagination", func(t *testing.T) {
		municipalities := []models.Municipality{
			{ID: "1", Name: "City 1", Code: "C001"},
			{ID: "2", Name: "City 2", Code: "C002"},
		}

		mockService.On("GetAllMunicipalities", 50, 0).Return(municipalities, int64(2), nil).Once()

		req := httptest.NewRequest("GET", "/municipalities", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("successful retrieval with custom pagination", func(t *testing.T) {
		municipalities := []models.Municipality{
			{ID: "1", Name: "City 1", Code: "C001"},
		}

		mockService.On("GetAllMunicipalities", 10, 5).Return(municipalities, int64(1), nil).Once()

		req := httptest.NewRequest("GET", "/municipalities?limit=10&offset=5", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("successful search", func(t *testing.T) {
		municipalities := []models.Municipality{
			{ID: "1", Name: "Test City", Code: "TC001"},
		}

		mockService.On("SearchMunicipalities", "test", 50, 0).Return(municipalities, int64(1), nil).Once()

		req := httptest.NewRequest("GET", "/municipalities?search=test", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestMunicipalityHandler_UpdateMunicipality(t *testing.T) {
	app := fiber.New()
	mockService := new(MockMunicipalityService)
	handler := &MunicipalityHandler{municipalityService: mockService}

	app.Put("/municipalities/:id", handler.UpdateMunicipality)

	t.Run("successful update", func(t *testing.T) {
		updates := models.Municipality{
			Name: "Updated City",
		}

		updatedMunicipality := &models.Municipality{
			ID:   "test-id",
			Name: "Updated City",
			Code: "TC001",
		}

		mockService.On("UpdateMunicipality", "test-id", mock.AnythingOfType("*models.Municipality")).
			Return(updatedMunicipality, nil).Once()

		body, _ := json.Marshal(updates)
		req := httptest.NewRequest("PUT", "/municipalities/test-id", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("municipality not found", func(t *testing.T) {
		updates := models.Municipality{
			Name: "Updated City",
		}

		mockService.On("UpdateMunicipality", "non-existent", mock.AnythingOfType("*models.Municipality")).
			Return(nil, gorm.ErrRecordNotFound).Once()

		body, _ := json.Marshal(updates)
		req := httptest.NewRequest("PUT", "/municipalities/non-existent", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestMunicipalityHandler_DeleteMunicipality(t *testing.T) {
	app := fiber.New()
	mockService := new(MockMunicipalityService)
	handler := &MunicipalityHandler{municipalityService: mockService}

	app.Delete("/municipalities/:id", handler.DeleteMunicipality)

	t.Run("successful deletion", func(t *testing.T) {
		mockService.On("DeleteMunicipality", "test-id").Return(nil).Once()

		req := httptest.NewRequest("DELETE", "/municipalities/test-id", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNoContent, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("municipality not found", func(t *testing.T) {
		mockService.On("DeleteMunicipality", "non-existent").
			Return(gorm.ErrRecordNotFound).Once()

		req := httptest.NewRequest("DELETE", "/municipalities/non-existent", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}