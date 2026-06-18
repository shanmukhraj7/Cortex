// Package handler contains Gin HTTP handlers for the settings-service.
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/shanmukhraj7/cortex/settings-service/internal/middleware"
	"github.com/shanmukhraj7/cortex/settings-service/internal/model"
	"github.com/shanmukhraj7/cortex/settings-service/internal/service"
)

// SettingsHandler handles preference read/write endpoints.
type SettingsHandler struct {
	svc *service.SettingsService
}

// NewSettingsHandler creates a SettingsHandler backed by the given service.
func NewSettingsHandler(svc *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{svc: svc}
}

// Get handles GET /settings
// Returns the authenticated user's full settings, or defaults if none are saved.
func (h *SettingsHandler) Get(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	settings, err := h.svc.Get(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIError{Code: 500, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// Put handles PUT /settings
// Fully replaces the user's settings with the request body.
func (h *SettingsHandler) Put(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	var prefs model.Preferences
	if err := c.ShouldBindJSON(&prefs); err != nil {
		c.JSON(http.StatusBadRequest, model.APIError{Code: 400, Message: err.Error()})
		return
	}

	settings, err := h.svc.Put(userID, prefs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIError{Code: 500, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// Patch handles PATCH /settings
// Partially updates only the fields present in the request body.
func (h *SettingsHandler) Patch(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	var partial map[string]interface{}
	if err := c.ShouldBindJSON(&partial); err != nil {
		c.JSON(http.StatusBadRequest, model.APIError{Code: 400, Message: err.Error()})
		return
	}
	if len(partial) == 0 {
		c.JSON(http.StatusBadRequest, model.APIError{Code: 400, Message: "request body must not be empty"})
		return
	}

	settings, err := h.svc.Patch(userID, partial)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIError{Code: 500, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// Delete handles DELETE /settings
// Resets the user's settings to factory defaults by removing the DB row.
func (h *SettingsHandler) Delete(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	if err := h.svc.Reset(userID); err != nil {
		c.JSON(http.StatusInternalServerError, model.APIError{Code: 500, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "settings reset to defaults"})
}
