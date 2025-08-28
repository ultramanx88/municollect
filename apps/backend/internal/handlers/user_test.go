package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	
	"municollect/internal/models"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	
	// Auto-migrate the models
	err = models.AutoMigrate(db)
	require.NoError(t, err)
	
	return db
}

// createTestUser creates a test user in the database
func createTestUser(t *testing.T, db *gorm.DB) *models.User {
	user := &models.User{
		ID:        "test-user-id",
		Email:     "test@example.com",
		FirstName: "John",
		LastName:  "Doe",
		Role:      models.UserRoleResident,
	}
	
	err := db.Create(user).Error
	require.NoError(t, err)
	
	return user
}

// createTestMunicipality creates a test municipality in the database
func createTestMunicipality(t *testing.T, db *gorm.DB) *models.Municipality {
	municipality := &models.Municipality{
		ID:   "test-municipality-id",
		Name: "Test Municipality",
		Code: "TEST",
	}
	
	err := db.Create(municipality).Error
	require.NoError(t, err)
	
	return municipality
}

func TestUserHandler_GetProfile(t *testing.T) {
	db := setupTestDB(t)
	handler := NewUserHandler(db)
	
	app := fiber.New()
	app.Get("/profile", func(c *fiber.Ctx) error {
		// Mock JWT middleware by setting user_id in context
		c.Locals("user_id", "test-user-id")
		return handler.GetProfile(c)
	})
	
	t.Run("successful profile retrieval", func(t *testing.T) {
		// Create test user
		createTestUser(t, db)
		
		req := httptest.NewRequest("GET", "/profile", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)
		
		assert.True(t, response["success"].(bool))
		assert.NotNil(t, response["data"])
		
		userData := response["data"].(map[string]interface{})
		assert.Equal(t, "test@example.com", userData["email"])
		assert.Equal(t, "John", userData["firstName"])
		assert.Equal(t, "Doe", userData["lastName"])
	})
	
	t.Run("user not found", func(t *testing.T) {
		app := fiber.New()
		app.Get("/profile", func(c *fiber.Ctx) error {
			c.Locals("user_id", "non-existent-user")
			return handler.GetProfile(c)
		})
		
		req := httptest.NewRequest("GET", "/profile", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
	
	t.Run("unauthorized - no user_id in context", func(t *testing.T) {
		app := fiber.New()
		app.Get("/profile", handler.GetProfile)
		
		req := httptest.NewRequest("GET", "/profile", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})
}

func TestUserHandler_UpdateProfile(t *testing.T) {
	db := setupTestDB(t)
	handler := NewUserHandler(db)
	
	app := fiber.New()
	app.Put("/profile", func(c *fiber.Ctx) error {
		c.Locals("user_id", "test-user-id")
		return handler.UpdateProfile(c)
	})
	
	t.Run("successful profile update", func(t *testing.T) {
		// Create test user
		createTestUser(t, db)
		
		updateData := UpdateProfileRequest{
			FirstName: "Jane",
			LastName:  "Smith",
			Email:     "jane@example.com",
		}
		
		body, err := json.Marshal(updateData)
		require.NoError(t, err)
		
		req := httptest.NewRequest("PUT", "/profile", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)
		
		assert.True(t, response["success"].(bool))
		userData := response["data"].(map[string]interface{})
		assert.Equal(t, "jane@example.com", userData["email"])
		assert.Equal(t, "Jane", userData["firstName"])
		assert.Equal(t, "Smith", userData["lastName"])
	})
	
	t.Run("validation error - invalid email", func(t *testing.T) {
		createTestUser(t, db)
		
		updateData := UpdateProfileRequest{
			FirstName: "Jane",
			LastName:  "Smith",
			Email:     "invalid-email",
		}
		
		body, err := json.Marshal(updateData)
		require.NoError(t, err)
		
		req := httptest.NewRequest("PUT", "/profile", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
	
	t.Run("email already taken", func(t *testing.T) {
		// Create first user
		createTestUser(t, db)
		
		// Create second user
		user2 := &models.User{
			ID:        "test-user-id-2",
			Email:     "existing@example.com",
			FirstName: "Existing",
			LastName:  "User",
			Role:      models.UserRoleResident,
		}
		err := db.Create(user2).Error
		require.NoError(t, err)
		
		// Try to update first user with second user's email
		updateData := UpdateProfileRequest{
			FirstName: "Jane",
			LastName:  "Smith",
			Email:     "existing@example.com",
		}
		
		body, err := json.Marshal(updateData)
		require.NoError(t, err)
		
		req := httptest.NewRequest("PUT", "/profile", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusConflict, resp.StatusCode)
	})
}

func TestUserHandler_GetUserMunicipalities(t *testing.T) {
	db := setupTestDB(t)
	handler := NewUserHandler(db)
	
	app := fiber.New()
	app.Get("/municipalities", func(c *fiber.Ctx) error {
		c.Locals("user_id", "test-user-id")
		return handler.GetUserMunicipalities(c)
	})
	
	t.Run("successful municipalities retrieval", func(t *testing.T) {
		// Create test user and municipality
		user := createTestUser(t, db)
		municipality := createTestMunicipality(t, db)
		
		// Create association
		association := &models.UserMunicipality{
			UserID:         user.ID,
			MunicipalityID: municipality.ID,
		}
		err := db.Create(association).Error
		require.NoError(t, err)
		
		req := httptest.NewRequest("GET", "/municipalities", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)
		
		assert.True(t, response["success"].(bool))
		assert.NotNil(t, response["data"])
		
		// Verify the municipality is in the response
		municipalities := response["data"].([]interface{})
		assert.Len(t, municipalities, 1)
	})
	
	t.Run("empty municipalities list for user with no associations", func(t *testing.T) {
		// Create test user but no municipality associations
		createTestUser(t, db)
		
		req := httptest.NewRequest("GET", "/municipalities", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)
		
		assert.True(t, response["success"].(bool))
		municipalities := response["data"].([]interface{})
		assert.Len(t, municipalities, 0)
	})
}

func TestUserHandler_AssociateMunicipality(t *testing.T) {
	db := setupTestDB(t)
	handler := NewUserHandler(db)
	
	app := fiber.New()
	app.Post("/municipalities", func(c *fiber.Ctx) error {
		c.Locals("user_id", "test-user-id")
		return handler.AssociateMunicipality(c)
	})
	
	t.Run("successful municipality association", func(t *testing.T) {
		// Create test user and municipality
		createTestUser(t, db)
		createTestMunicipality(t, db)
		
		associationData := MunicipalityAssociationRequest{
			MunicipalityID: "test-municipality-id",
		}
		
		body, err := json.Marshal(associationData)
		require.NoError(t, err)
		
		req := httptest.NewRequest("POST", "/municipalities", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)
		
		assert.True(t, response["success"].(bool))
	})
	
	t.Run("municipality not found", func(t *testing.T) {
		createTestUser(t, db)
		
		associationData := MunicipalityAssociationRequest{
			MunicipalityID: "non-existent-municipality",
		}
		
		body, err := json.Marshal(associationData)
		require.NoError(t, err)
		
		req := httptest.NewRequest("POST", "/municipalities", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
	
	t.Run("validation error - invalid UUID", func(t *testing.T) {
		createTestUser(t, db)
		
		associationData := MunicipalityAssociationRequest{
			MunicipalityID: "invalid-uuid",
		}
		
		body, err := json.Marshal(associationData)
		require.NoError(t, err)
		
		req := httptest.NewRequest("POST", "/municipalities", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

func TestUserHandler_RemoveMunicipalityAssociation(t *testing.T) {
	db := setupTestDB(t)
	handler := NewUserHandler(db)
	
	app := fiber.New()
	app.Delete("/municipalities/:municipalityId", func(c *fiber.Ctx) error {
		c.Locals("user_id", "test-user-id")
		return handler.RemoveMunicipalityAssociation(c)
	})
	
	t.Run("successful municipality association removal", func(t *testing.T) {
		// Create test user and municipality
		createTestUser(t, db)
		createTestMunicipality(t, db)
		
		req := httptest.NewRequest("DELETE", "/municipalities/test-municipality-id", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)
		
		assert.True(t, response["success"].(bool))
	})
	
	t.Run("missing municipality ID", func(t *testing.T) {
		createTestUser(t, db)
		
		req := httptest.NewRequest("DELETE", "/municipalities/", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}