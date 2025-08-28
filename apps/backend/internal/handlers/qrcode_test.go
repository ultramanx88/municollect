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

// MockQRCodeService is a mock implementation of QRCodeService
type MockQRCodeService struct {
	mock.Mock
}

func (m *MockQRCodeService) GenerateQRCode(req *services.QRCodeRequest) (*models.QRCode, error) {
	args := m.Called(req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.QRCode), args.Error(1)
}

func (m *MockQRCodeService) ValidateQRCode(qrCodeString string) (*models.Payment, error) {
	args := m.Called(qrCodeString)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Payment), args.Error(1)
}

func (m *MockQRCodeService) GetQRCodeDetails(qrCodeString string) (*models.QRCode, error) {
	args := m.Called(qrCodeString)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.QRCode), args.Error(1)
}

func (m *MockQRCodeService) RegenerateQRCode(paymentID string, req *services.QRCodeRequest) (*models.QRCode, error) {
	args := m.Called(paymentID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.QRCode), args.Error(1)
}

func TestQRCodeHandler_GenerateQRCode(t *testing.T) {
	app := fiber.New()
	mockService := new(MockQRCodeService)
	handler := &QRCodeHandler{qrCodeService: mockService}

	app.Post("/qr/generate", handler.GenerateQRCode)

	t.Run("successful QR code generation", func(t *testing.T) {
		req := services.QRCodeRequest{
			PaymentID:      "test-payment-id",
			ExpirationMins: 60,
			Size:           256,
		}

		imageURL := "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEA..."
		expectedQRCode := &models.QRCode{
			Code: "test-qr-code",
			Data: models.QRCodeData{
				PaymentID:      req.PaymentID,
				MunicipalityID: "test-municipality-id",
				Amount:         100.00,
				Currency:       models.CurrencyUSD,
				ServiceType:    models.ServiceTypeWasteManagement,
				ExpiresAt:      time.Now().Add(60 * time.Minute),
			},
			ImageURL: &imageURL,
		}

		mockService.On("GenerateQRCode", mock.AnythingOfType("*services.QRCodeRequest")).
			Return(expectedQRCode, nil).Once()

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/qr/generate", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("invalid request body", func(t *testing.T) {
		httpReq := httptest.NewRequest("POST", "/qr/generate", bytes.NewReader([]byte("invalid json")))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("missing payment ID", func(t *testing.T) {
		req := services.QRCodeRequest{
			ExpirationMins: 60,
		}

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/qr/generate", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("payment not found", func(t *testing.T) {
		req := services.QRCodeRequest{
			PaymentID: "non-existent-payment",
		}

		mockService.On("GenerateQRCode", mock.AnythingOfType("*services.QRCodeRequest")).
			Return(nil, gorm.ErrRecordNotFound).Once()

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/qr/generate", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestQRCodeHandler_ValidateQRCode(t *testing.T) {
	app := fiber.New()
	mockService := new(MockQRCodeService)
	handler := &QRCodeHandler{qrCodeService: mockService}

	app.Post("/qr/validate", handler.ValidateQRCode)

	t.Run("successful QR code validation", func(t *testing.T) {
		req := struct {
			Code string `json:"code"`
		}{
			Code: "test-qr-code",
		}

		expectedPayment := &models.Payment{
			ID:             "test-payment-id",
			MunicipalityID: "test-municipality-id",
			UserID:         "test-user-id",
			ServiceType:    models.ServiceTypeWasteManagement,
			Amount:         100.00,
			Status:         models.PaymentStatusPending,
		}

		mockService.On("ValidateQRCode", "test-qr-code").Return(expectedPayment, nil).Once()

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/qr/validate", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("invalid QR code", func(t *testing.T) {
		req := struct {
			Code string `json:"code"`
		}{
			Code: "invalid-qr-code",
		}

		mockService.On("ValidateQRCode", "invalid-qr-code").
			Return(nil, gorm.ErrRecordNotFound).Once()

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/qr/validate", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("missing QR code", func(t *testing.T) {
		req := struct {
			Code string `json:"code"`
		}{
			Code: "",
		}

		body, _ := json.Marshal(req)
		httpReq := httptest.NewRequest("POST", "/qr/validate", bytes.NewReader(body))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(httpReq)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})
}

func TestQRCodeHandler_GetQRCodeDetails(t *testing.T) {
	app := fiber.New()
	mockService := new(MockQRCodeService)
	handler := &QRCodeHandler{qrCodeService: mockService}

	app.Get("/qr/:code/details", handler.GetQRCodeDetails)

	t.Run("successful QR code details retrieval", func(t *testing.T) {
		expectedQRCode := &models.QRCode{
			Code: "test-qr-code",
			Data: models.QRCodeData{
				PaymentID:      "test-payment-id",
				MunicipalityID: "test-municipality-id",
				Amount:         100.00,
				Currency:       models.CurrencyUSD,
				ServiceType:    models.ServiceTypeWasteManagement,
				ExpiresAt:      time.Now().Add(60 * time.Minute),
			},
		}

		mockService.On("GetQRCodeDetails", "test-qr-code").Return(expectedQRCode, nil).Once()

		httpReq := httptest.NewRequest("GET", "/qr/test-qr-code/details", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("QR code not found", func(t *testing.T) {
		mockService.On("GetQRCodeDetails", "non-existent").
			Return(nil, gorm.ErrRecordNotFound).Once()

		httpReq := httptest.NewRequest("GET", "/qr/non-existent/details", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})
}

func TestQRCodeHandler_RegenerateQRCode(t *testing.T) {
	app := fiber.New()
	mockService := new(MockQRCodeService)
	handler := &QRCodeHandler{qrCodeService: mockService}

	app.Post("/qr/:paymentId/regenerate", handler.RegenerateQRCode)

	t.Run("successful QR code regeneration", func(t *testing.T) {
		imageURL := "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEA..."
		expectedQRCode := &models.QRCode{
			Code: "new-qr-code",
			Data: models.QRCodeData{
				PaymentID:      "test-payment-id",
				MunicipalityID: "test-municipality-id",
				Amount:         100.00,
				Currency:       models.CurrencyUSD,
				ServiceType:    models.ServiceTypeWasteManagement,
				ExpiresAt:      time.Now().Add(60 * time.Minute),
			},
			ImageURL: &imageURL,
		}

		mockService.On("RegenerateQRCode", "test-payment-id", mock.AnythingOfType("*services.QRCodeRequest")).
			Return(expectedQRCode, nil).Once()

		httpReq := httptest.NewRequest("POST", "/qr/test-payment-id/regenerate", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("payment not found", func(t *testing.T) {
		mockService.On("RegenerateQRCode", "non-existent", mock.AnythingOfType("*services.QRCodeRequest")).
			Return(nil, gorm.ErrRecordNotFound).Once()

		httpReq := httptest.NewRequest("POST", "/qr/non-existent/regenerate", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode)

		mockService.AssertExpectations(t)
	})

	t.Run("missing payment ID", func(t *testing.T) {
		httpReq := httptest.NewRequest("POST", "/qr//regenerate", nil)
		resp, err := app.Test(httpReq)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusNotFound, resp.StatusCode) // Fiber returns 404 for missing params
	})
}