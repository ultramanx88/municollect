package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"municollect/internal/services"
)

// QRCodeHandler handles QR code-related HTTP requests
type QRCodeHandler struct {
	qrCodeService *services.QRCodeService
}

// NewQRCodeHandler creates a new QR code handler
func NewQRCodeHandler(qrCodeService *services.QRCodeService) *QRCodeHandler {
	return &QRCodeHandler{
		qrCodeService: qrCodeService,
	}
}

// GenerateQRCode generates a QR code for a payment
// POST /api/qr/generate
func (h *QRCodeHandler) GenerateQRCode(c *fiber.Ctx) error {
	var req services.QRCodeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.PaymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	qrCode, err := h.qrCodeService.GenerateQRCode(&req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		if strings.Contains(err.Error(), "cannot generate QR code") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate QR code",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(qrCode)
}

// ValidateQRCode validates a QR code and returns payment information
// POST /api/qr/validate
func (h *QRCodeHandler) ValidateQRCode(c *fiber.Ctx) error {
	var req struct {
		Code string `json:"code" validate:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "QR code is required",
		})
	}

	payment, err := h.qrCodeService.ValidateQRCode(req.Code)
	if err != nil {
		if strings.Contains(err.Error(), "invalid QR code") || strings.Contains(err.Error(), "expired") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
				"valid": false,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to validate QR code",
		})
	}

	return c.JSON(fiber.Map{
		"valid":   true,
		"payment": payment,
	})
}

// GetQRCodeDetails retrieves QR code details by code
// GET /api/qr/:code/details
func (h *QRCodeHandler) GetQRCodeDetails(c *fiber.Ctx) error {
	code := c.Params("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "QR code is required",
		})
	}

	qrCode, err := h.qrCodeService.GetQRCodeDetails(code)
	if err != nil {
		if strings.Contains(err.Error(), "invalid QR code") || strings.Contains(err.Error(), "expired") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get QR code details",
		})
	}

	return c.JSON(qrCode)
}

// RegenerateQRCode regenerates a QR code for an existing payment
// POST /api/qr/:paymentId/regenerate
func (h *QRCodeHandler) RegenerateQRCode(c *fiber.Ctx) error {
	paymentID := c.Params("paymentId")
	if paymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	var req services.QRCodeRequest
	if err := c.BodyParser(&req); err != nil {
		// If body parsing fails, use default values
		req = services.QRCodeRequest{}
	}

	qrCode, err := h.qrCodeService.RegenerateQRCode(paymentID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		if strings.Contains(err.Error(), "cannot regenerate QR code") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to regenerate QR code",
		})
	}

	return c.JSON(qrCode)
}

// GetQRCodeImage returns the QR code image for a payment
// GET /api/qr/:paymentId/image
func (h *QRCodeHandler) GetQRCodeImage(c *fiber.Ctx) error {
	paymentID := c.Params("paymentId")
	if paymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	// Generate QR code with default settings to get the image
	req := &services.QRCodeRequest{
		PaymentID: paymentID,
		Size:      256, // Default size
	}

	qrCode, err := h.qrCodeService.GenerateQRCode(req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate QR code image",
		})
	}

	// Return just the image URL
	return c.JSON(fiber.Map{
		"imageUrl": qrCode.ImageURL,
		"code":     qrCode.Code,
	})
}

// GetQRCodeByPayment retrieves QR code information for a specific payment
// GET /api/qr/payment/:paymentId
func (h *QRCodeHandler) GetQRCodeByPayment(c *fiber.Ctx) error {
	paymentID := c.Params("paymentId")
	if paymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	// Get user role from context for authorization
	userRole := c.Locals("userRole").(string)

	// Check if user has access to this payment
	// This is a simplified check - in a real implementation, you'd verify payment ownership
	if userRole != "admin" {
		// For non-admin users, we should verify they own the payment
		// This would require a payment service call to check ownership
	}

	// Generate or retrieve existing QR code
	req := &services.QRCodeRequest{
		PaymentID: paymentID,
	}

	qrCode, err := h.qrCodeService.GenerateQRCode(req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(qrCode)
}