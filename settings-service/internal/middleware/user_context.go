// Package middleware provides Gin middleware for the settings-service.
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// UserIDKey is the key under which the authenticated user's ID is stored
// in the Gin context after the UserContext middleware runs.
const UserIDKey = "userId"

// UserContext extracts the X-User-Id header injected by the API Gateway
// (after JWT validation) and stores it in the Gin context.
//
// This service never validates JWTs directly — it trusts the gateway.
// If the header is missing, the request is rejected with 401.
func UserContext() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-Id")
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "missing X-User-Id header — request must pass through the API Gateway",
			})
			return
		}
		c.Set(UserIDKey, userID)
		c.Next()
	}
}
