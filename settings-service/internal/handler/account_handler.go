package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/shanmukhraj7/cortex/settings-service/internal/middleware"
	"github.com/shanmukhraj7/cortex/settings-service/internal/model"
	"github.com/shanmukhraj7/cortex/settings-service/internal/service"
)

// AccountHandler handles password management.
type AccountHandler struct {
	svc *service.AccountService
}

// NewAccountHandler creates an AccountHandler backed by the given service.
func NewAccountHandler(svc *service.AccountService) *AccountHandler {
	return &AccountHandler{svc: svc}
}

// changePasswordRequest is the request body for PUT /settings/account/password.
type changePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword"     binding:"required,min=8"`
}

// ChangePassword handles PUT /settings/account/password
// Verifies the user's current password then updates the bcrypt hash.
func (h *AccountHandler) ChangePassword(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIError{Code: 400, Message: err.Error()})
		return
	}

	if err := h.svc.ChangePassword(userID, req.CurrentPassword, req.NewPassword); err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPassword):
			c.JSON(http.StatusUnauthorized, model.APIError{Code: 401, Message: "current password is incorrect"})
		case errors.Is(err, service.ErrUserNotFound):
			c.JSON(http.StatusNotFound, model.APIError{Code: 404, Message: "user not found"})
		default:
			c.JSON(http.StatusInternalServerError, model.APIError{Code: 500, Message: err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password updated successfully"})
}
