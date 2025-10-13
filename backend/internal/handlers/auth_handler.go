package handlers

import (
	"net/http"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/HarsukritP/havn/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid request format",
			Code:    "VALIDATION_ERROR",
			Details: err.Error(),
		})
		return
	}

	user, token, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "INTERNAL_ERROR"
		
		if err == services.ErrEmailExists {
			status = http.StatusConflict
			code = "ALREADY_EXISTS"
		}

		c.JSON(status, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
			Code:    code,
		})
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse{
		Success: true,
		Data: models.AuthResponse{
			User:  user,
			Token: token,
		},
		Message: "Account created successfully",
	})
}

// Login handles user authentication
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid request format",
			Code:    "VALIDATION_ERROR",
		})
		return
	}

	user, token, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "INTERNAL_ERROR"
		message := "Internal server error"
		
		if err == services.ErrInvalidCredentials {
			status = http.StatusUnauthorized
			code = "INVALID_CREDENTIALS"
			message = "Invalid email or password"
		}

		c.JSON(status, models.ErrorResponse{
			Success: false,
			Error:   message,
			Code:    code,
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: models.AuthResponse{
			User:  user,
			Token: token,
		},
	})
}

// Logout handles user logout (invalidates token)
func (h *AuthHandler) Logout(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if len(token) > 7 {
		token = token[7:] // Remove "Bearer " prefix
	}

	if err := h.authService.Logout(c.Request.Context(), token); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to logout",
			Code:    "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data:    nil,
		Message: "Logged out successfully",
	})
}

