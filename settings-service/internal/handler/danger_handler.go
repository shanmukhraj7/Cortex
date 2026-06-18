package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/shanmukhraj7/cortex/settings-service/internal/middleware"
	"github.com/shanmukhraj7/cortex/settings-service/internal/model"
	"github.com/shanmukhraj7/cortex/settings-service/internal/service"
)

// DangerHandler handles irreversible account deletion.
type DangerHandler struct {
	svc *service.AccountService
}

// NewDangerHandler creates a DangerHandler backed by the given service.
func NewDangerHandler(svc *service.AccountService) *DangerHandler {
	return &DangerHandler{svc: svc}
}

// deleteAccountRequest is the request body for DELETE /settings/account.
// Password confirmation is required to prevent accidental deletion.
type deleteAccountRequest struct {
	Password string `json:"password" binding:"required"`
}

// DeleteAccount handles DELETE /settings/account
// Requires password confirmation, then atomically removes all user data:
// user_settings → notes (+ embeddings) → users.
//
// Returns 204 No Content on success.
// The client should immediately clear the JWT from storage — the user row
// no longer exists, so any subsequent auth will fail.
func (h *DangerHandler) DeleteAccount(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	var req deleteAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIError{Code: 400, Message: err.Error()})
		return
	}

	if err := h.svc.DeleteAccount(userID, req.Password); err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPassword):
			c.JSON(http.StatusUnauthorized, model.APIError{Code: 401, Message: "password is incorrect"})
		case errors.Is(err, service.ErrUserNotFound):
			c.JSON(http.StatusNotFound, model.APIError{Code: 404, Message: "user not found"})
		default:
			c.JSON(http.StatusInternalServerError, model.APIError{Code: 500, Message: err.Error()})
		}
		return
	}

	// 204 No Content — no body, client must clear session
	c.Status(http.StatusNoContent)
}
