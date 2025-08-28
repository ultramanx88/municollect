package handlers

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"municollect/internal/models"
	"municollect/internal/services"
)

// MunicipalityHandler handles municipality-related HTTP requests
type MunicipalityHandler struct {
	municipalityService *services.MunicipalityService
}

// NewMunicipalityHandler creates a new municipality handler
func NewMunicipalityHandler(municipalityService *services.MunicipalityService) *MunicipalityHandler {
	return &MunicipalityHandler{
		municipalityService: municipalityService,
	}
}

// CreateMunicipality creates a new municipality
// POST /api/municipalities
func (h *MunicipalityHandler) CreateMunicipality(c *fiber.Ctx) error {
	var municipality models.Municipality
	if err := c.BodyParser(&municipality); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.municipalityService.CreateMunicipality(&municipality); err != nil {
		if strings.Contains(err.Error(), "already exists") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(municipality)
}

// GetMunicipality retrieves a municipality by ID
// GET /api/municipalities/:id
func (h *MunicipalityHandler) GetMunicipality(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Municipality ID is required",
		})
	}

	municipality, err := h.municipalityService.GetMunicipalityByID(id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve municipality",
		})
	}

	return c.JSON(municipality)
}

// GetMunicipalities retrieves all municipalities with optional pagination and search
// GET /api/municipalities
func (h *MunicipalityHandler) GetMunicipalities(c *fiber.Ctx) error {
	// Parse query parameters
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")
	search := c.Query("search", "")

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

	var municipalities []models.Municipality
	var total int64

	if search != "" {
		municipalities, total, err = h.municipalityService.SearchMunicipalities(search, limit, offset)
	} else {
		municipalities, total, err = h.municipalityService.GetAllMunicipalities(limit, offset)
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve municipalities",
		})
	}

	return c.JSON(fiber.Map{
		"municipalities": municipalities,
		"total":          total,
		"limit":          limit,
		"offset":         offset,
	})
}

// UpdateMunicipality updates an existing municipality
// PUT /api/municipalities/:id
func (h *MunicipalityHandler) UpdateMunicipality(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Municipality ID is required",
		})
	}

	var updates models.Municipality
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	municipality, err := h.municipalityService.UpdateMunicipality(id, &updates)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		if strings.Contains(err.Error(), "already exists") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(municipality)
}

// DeleteMunicipality deletes a municipality by ID
// DELETE /api/municipalities/:id
func (h *MunicipalityHandler) DeleteMunicipality(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Municipality ID is required",
		})
	}

	if err := h.municipalityService.DeleteMunicipality(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		if strings.Contains(err.Error(), "cannot delete") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete municipality",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// GetMunicipalityByCode retrieves a municipality by code
// GET /api/municipalities/code/:code
func (h *MunicipalityHandler) GetMunicipalityByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Municipality code is required",
		})
	}

	municipality, err := h.municipalityService.GetMunicipalityByCode(code)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve municipality",
		})
	}

	return c.JSON(municipality)
}