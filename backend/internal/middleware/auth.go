package middleware

import (
	"net/http"
	"strings"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/HarsukritP/havn/backend/internal/services"
	"github.com/gin-gonic/gin"
)

// AuthRequired is a middleware that requires JWT authentication
func AuthRequired(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error:   "Authorization header required",
				Code:    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error:   "Invalid authorization header format",
				Code:    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		token := parts[1]

		// Check if token is blacklisted
		blacklisted, err := authService.IsTokenBlacklisted(c.Request.Context(), token)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Success: false,
				Error:   "Failed to validate token",
				Code:    "INTERNAL_ERROR",
			})
			c.Abort()
			return
		}

		if blacklisted {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error:   "Token has been invalidated",
				Code:    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		// Validate token
		claims, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error:   "Invalid or expired token",
				Code:    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		// Set user ID in context
		userID := claims["user_id"].(string)
		c.Set("user_id", userID)

		c.Next()
	}
}

