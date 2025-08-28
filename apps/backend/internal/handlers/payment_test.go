package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"

	"municollect/internal/models"
	"municollect/internal/services"
)

// MockPaymentService is a mock implementation of PaymentService
type MockPaymentService struct {
	mock.Mock
}

func (m *MockPaymentService) CreatePayment(userID string, req *services.PaymentRequest) (*models.Payment, error) {
	args := m.Called(userID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Payment), args.Error(1)
}

func (m *MockPaymentService) GetPaymentByID(paymentID string, userID *string) (*models.Payment, error) {
	args := m.Called(paymentID, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Payment), args.Error(1)
}

func (m *MockPaymentService) GetPaymentHistory(filter *services.PaymentFilter, limit, offset int) ([]models.Payment, int64, error) {
	args := m.Called(filter, limit, offset)
	return args.Get(0).([]models.Payment), args.Get(1).(int64), args.Error(2)
}

func (m *MockPaymentService) UpdatePaymentStatus(paymentID string, status models.PaymentStatus, transactionData map[string]interface{}) (*models.Payment, error) {
	args := m.Called(paymentID, status, transactionData)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Payment), args.Error(1)
}

func (m *MockPaymentService) GetPaymentsByUser(userID string, limit, offset int) ([]models.Payment, int64, error) {
	args := m.Called(userID, limit, offset)
	return args.Get(0).([]models.Payment), args.Get(1).(int64), args.Error(2)
}

func (m *MockPaymentService) GetPaymentsByMunicipality(municipalityID string, limit, offset int) ([]models.Payment, int64, error) {
	args := m.Called(municipalityID, limit, offset)
	return args.Get(0).([]models.Payment), args.Get(1).(int64), args.Error(2)
}

func TestPaymentHandler_CreatePayment(t *testing.T) {
	app := fiber.New()
	mockService := new(MockPaymentService)
	handler := &PaymentHandler{paymentService: mockService}

	app.Post("/payments", func(c *fiber.Ctx) error {
		// Mock JWT middleware setting user context
		c.Locals("userID", "test-user-id")
		c.Locals("userRole", "resident")
		return handler.CreatePayment(c)
	})

	t.Run("successful payment creation", func(t *testing.T) {
		req := services.PaymentRequest{
			MunicipalityID: "test-municipality-id",
			ServiceType:    models.ServiceTypeWasteManagement,
			Amount:         100.00,
			Currency:       models.CurrencyUSD,
		}

		expectedPayment := &models.Payment{
			ID:             "test-payment-id",
			MunicipalityID: req.MunicipalityID,
			UserID:         "test-user-id",
			ServiceType:    req.ServiceType,
			Amount:         req.Amount,
			Currency:       req.Currency,
			Status:         models.PaymentStatusPending,
		}

		mockService.On("CreatePayment", "test-user-id", mock.AnythingOfType("*services.PaymentRequest")).
			Return(expectedPayment, nil).Once()

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/payments", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("invalid request body", func(t *testing.T) {
		httpReq := httptest.NewRequest("POST", "/payments", bytes.NewReader([]byte("invalid json")))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("missing municipality ID", func(t *testing.T) {
		req := services.PaymentRequest{
			ServiceType: models.ServiceTypeWasteManagement,
			Amount:      100.00,
		}

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/payments", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("invalid amount", func(t *testing.T) {
		req := services.PaymentRequest{
			MunicipalityID: "test-municipality-id",
			ServiceType:    models.ServiceTypeWasteManagement,
			Amount:         0,
		}

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/payments", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})
}

func TestPaymentHandler_GetPayment(t *testing.T) {
	app := fiber.New()
	mockService := new(MockPaymentService)
	handler := &PaymentHandler{paymentService: mockService}

	app.Get("/payments/:id", func(c *fiber.Ctx) error {
		// Mock JWT middleware setting user context
		c.Locals("userID", "test-user-id")
		c.Locals("userRole", "resident")
		return handler.GetPayment(c)
	})

	t.Run("successful payment retrieval", func(t *testing.T) {
		payment := &models.Payment{
			ID:             "test-payment-id",
			MunicipalityID: "test-municipality-id",
			UserID:         "test-user-id",
			ServiceType:    models.ServiceTypeWasteManagement,
			Amount:         100.00,
			Status:         models.PaymentStatusPending,
		}

		userID := "test-user-id"
		mockService.On("GetPaymentByID", "test-payment-id", &userID).Return(payment, nil).Once()

		httpReq := httptest.NewRequest("GET", "/payments/test-payment-id", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("payment not found", func(t *testing.T) {
		userID := "test-user-id"
		mockService.On("GetPaymentByID", "non-existent", &userID).
			Return(nil, gorm.ErrRecordNotFound).Once()

		httpReq := httptest.NewRequest("GET", "/payments/non-existent", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestPaymentHandler_GetPaymentStatus(t *testing.T) {
	app := fiber.New()
	mockService := new(MockPaymentService)
	handler := &PaymentHandler{paymentService: mockService}

	app.Get("/payments/:id/status", func(c *fiber.Ctx) error {
		// Mock JWT middleware setting user context
		c.Locals("userID", "test-user-id")
		c.Locals("userRole", "resident")
		return handler.GetPaymentStatus(c)
	})

	t.Run("successful status retrieval", func(t *testing.T) {
		now := time.Now()
		payment := &models.Payment{
			ID:        "test-payment-id",
			Status:    models.PaymentStatusCompleted,
			Amount:    100.00,
			Currency:  models.CurrencyUSD,
			CreatedAt: now,
			PaidAt:    &now,
		}

		userID := "test-user-id"
		mockService.On("GetPaymentByID", "test-payment-id", &userID).Return(payment, nil).Once()

		httpReq := httptest.NewRequest("GET", "/payments/test-payment-id/status", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestPaymentHandler_UpdatePaymentStatus(t *testing.T) {
	app := fiber.New()
	mockService := new(MockPaymentService)
	handler := &PaymentHandler{paymentService: mockService}

	app.Put("/payments/:id/status", func(c *fiber.Ctx) error {
		// Mock JWT middleware setting user context
		c.Locals("userID", "admin-user-id")
		c.Locals("userRole", "admin")
		return handler.UpdatePaymentStatus(c)
	})

	t.Run("successful status update", func(t *testing.T) {
		req := struct {
			Status          models.PaymentStatus   `json:"status"`
			TransactionData map[string]interface{} `json:"transactionData,omitempty"`
		}{
			Status: models.PaymentStatusCompleted,
			TransactionData: map[string]interface{}{
				"transactionId": "tx-123",
			},
		}

		updatedPayment := &models.Payment{
			ID:     "test-payment-id",
			Status: models.PaymentStatusCompleted,
		}

		mockService.On("UpdatePaymentStatus", "test-payment-id", models.PaymentStatusCompleted, req.TransactionData).
			Return(updatedPayment, nil).Once()

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("PUT", "/payments/test-payment-id/status", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("invalid status", func(t *testing.T) {
		req := struct {
			Status string `json:"status"`
		}{
			Status: "",
		}

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("PUT", "/payments/test-payment-id/status", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})
}

func TestPaymentHandler_GetPaymentHistory(t *testing.T) {
	app := fiber.New()
	mockService := new(MockPaymentService)
	handler := &PaymentHandler{paymentService: mockService}

	app.Get("/payments/history", func(c *fiber.Ctx) error {
		// Mock JWT middleware setting user context
		c.Locals("userID", "test-user-id")
		c.Locals("userRole", "resident")
		return handler.GetPaymentHistory(c)
	})

	t.Run("successful history retrieval", func(t *testing.T) {
		payments := []models.Payment{
			{
				ID:             "payment-1",
				MunicipalityID: "municipality-1",
				UserID:         "test-user-id",
				ServiceType:    models.ServiceTypeWasteManagement,
				Amount:         100.00,
				Status:         models.PaymentStatusCompleted,
			},
		}

		mockService.On("GetPaymentHistory", mock.AnythingOfType("*services.PaymentFilter"), 50, 0).
			Return(payments, int64(1), nil).Once()

		httpReq := httptest.NewRequest("GET", "/payments/history", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("history with pagination", func(t *testing.T) {
		payments := []models.Payment{}

		mockService.On("GetPaymentHistory", mock.AnythingOfType("*services.PaymentFilter"), 10, 5).
			Return(payments, int64(0), nil).Once()

		httpReq := httptest.NewRequest("GET", "/payments/history?limit=10&offset=5", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}