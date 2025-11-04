package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/services"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	service *services.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// Signup handles POST /api/v1/auth/signup
func (h *UserHandler) Signup(c *gin.Context) {
	// TODO: Implement (Supabase handles most of this)
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Signup not yet implemented - use Supabase directly",
		},
	})
}

// Login handles POST /api/v1/auth/login
func (h *UserHandler) Login(c *gin.Context) {
	// TODO: Implement (Supabase handles most of this)
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Login not yet implemented - use Supabase directly",
		},
	})
}

// Search handles GET /api/v1/users/search
func (h *UserHandler) Search(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "User search not yet implemented",
		},
	})
}

// GetProfile handles GET /api/v1/users/me
func (h *UserHandler) GetProfile(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Get profile not yet implemented",
		},
	})
}

// UpdateProfile handles PUT /api/v1/users/me
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Update profile not yet implemented",
		},
	})
}

