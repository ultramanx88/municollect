package handlers

import (
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"municollect/internal/models"
	"municollect/internal/services"
)

// PaymentHandler handles payment-related HTTP requests
type PaymentHandler struct {
	paymentService *services.PaymentService
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(paymentService *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
	}
}

// CreatePayment creates a new payment
// POST /api/payments/initiate
func (h *PaymentHandler) CreatePayment(c *fiber.Ctx) error {
	// Get user ID from context (set by JWT middleware)
	userID := c.Locals("userID").(string)

	var req services.PaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.MunicipalityID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Municipality ID is required",
		})
	}
	if req.ServiceType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Service type is required",
		})
	}
	if req.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Amount must be greater than 0",
		})
	}

	payment, err := h.paymentService.CreatePayment(userID, &req)
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

	return c.Status(fiber.StatusCreated).JSON(payment)
}

// GetPayment retrieves a payment by ID
// GET /api/payments/:id
func (h *PaymentHandler) GetPayment(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	if paymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	// Get user ID from context for authorization
	userID := c.Locals("userID").(string)
	userRole := c.Locals("userRole").(string)

	// Admin can view any payment, regular users can only view their own
	var userIDFilter *string
	if userRole != "admin" {
		userIDFilter = &userID
	}

	payment, err := h.paymentService.GetPaymentByID(paymentID, userIDFilter)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve payment",
		})
	}

	return c.JSON(payment)
}

// GetPaymentStatus retrieves the status of a payment
// GET /api/payments/:id/status
func (h *PaymentHandler) GetPaymentStatus(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	if paymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	// Get user ID from context for authorization
	userID := c.Locals("userID").(string)
	userRole := c.Locals("userRole").(string)

	// Admin can view any payment, regular users can only view their own
	var userIDFilter *string
	if userRole != "admin" {
		userIDFilter = &userID
	}

	payment, err := h.paymentService.GetPaymentByID(paymentID, userIDFilter)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve payment status",
		})
	}

	return c.JSON(fiber.Map{
		"id":        payment.ID,
		"status":    payment.Status,
		"amount":    payment.Amount,
		"currency":  payment.Currency,
		"createdAt": payment.CreatedAt,
		"paidAt":    payment.PaidAt,
	})
}

// UpdatePaymentStatus updates the status of a payment
// PUT /api/payments/:id/status
func (h *PaymentHandler) UpdatePaymentStatus(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	if paymentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment ID is required",
		})
	}

	var req struct {
		Status          models.PaymentStatus   `json:"status" validate:"required"`
		TransactionData map[string]interface{} `json:"transactionData,omitempty"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Status is required",
		})
	}

	payment, err := h.paymentService.UpdatePaymentStatus(paymentID, req.Status, req.TransactionData)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		if strings.Contains(err.Error(), "invalid status transition") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update payment status",
		})
	}

	return c.JSON(payment)
}

// GetPaymentHistory retrieves payment history with filtering
// GET /api/payments/history
func (h *PaymentHandler) GetPaymentHistory(c *fiber.Ctx) error {
	// Parse query parameters
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")
	municipalityID := c.Query("municipalityId")
	serviceType := c.Query("serviceType")
	status := c.Query("status")
	dateFromStr := c.Query("dateFrom")
	dateToStr := c.Query("dateTo")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100 // Cap at 100 for performance
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get user ID from context
	userID := c.Locals("userID").(string)
	userRole := c.Locals("userRole").(string)

	// Build filter
	filter := &services.PaymentFilter{}

	// Regular users can only see their own payments
	if userRole != "admin" {
		filter.UserID = &userID
	} else if municipalityID != "" {
		// Admin can filter by municipality
		filter.MunicipalityID = &municipalityID
	}

	if serviceType != "" {
		st := models.ServiceType(serviceType)
		filter.ServiceType = &st
	}

	if status != "" {
		ps := models.PaymentStatus(status)
		filter.Status = &ps
	}

	if dateFromStr != "" {
		if dateFrom, err := time.Parse(time.RFC3339, dateFromStr); err == nil {
			filter.DateFrom = &dateFrom
		}
	}

	if dateToStr != "" {
		if dateTo, err := time.Parse(time.RFC3339, dateToStr); err == nil {
			filter.DateTo = &dateTo
		}
	}

	payments, total, err := h.paymentService.GetPaymentHistory(filter, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve payment history",
		})
	}

	return c.JSON(fiber.Map{
		"payments": payments,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

// GetUserPayments retrieves all payments for the authenticated user
// GET /api/payments/user
func (h *PaymentHandler) GetUserPayments(c *fiber.Ctx) error {
	// Parse query parameters
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get user ID from context
	userID := c.Locals("userID").(string)

	payments, total, err := h.paymentService.GetPaymentsByUser(userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve user payments",
		})
	}

	return c.JSON(fiber.Map{
		"payments": payments,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

// GetMunicipalityPayments retrieves all payments for a specific municipality (admin only)
// GET /api/payments/municipality/:municipalityId
func (h *PaymentHandler) GetMunicipalityPayments(c *fiber.Ctx) error {
	municipalityID := c.Params("municipalityId")
	if municipalityID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Municipality ID is required",
		})
	}

	// Parse query parameters
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	payments, total, err := h.paymentService.GetPaymentsByMunicipality(municipalityID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve municipality payments",
		})
	}

	return c.JSON(fiber.Map{
		"payments": payments,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}