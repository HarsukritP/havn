package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/middleware"
	"github.com/harrypall/havn-backend/internal/services"
	"github.com/rs/zerolog/log"
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
	// Note: Supabase Auth handles signup on the client side
	// This endpoint is mainly for creating/updating the profile after Supabase signup
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Signup should be done through Supabase client - use signUp() method",
			"details": "After Supabase signup, the profile will be automatically created via database trigger or you can call PUT /api/v1/users/me to complete profile setup",
		},
	})
}

// Login handles POST /api/v1/auth/login
func (h *UserHandler) Login(c *gin.Context) {
	// Note: Supabase Auth handles login on the client side
	// This endpoint is not needed as login is handled by Supabase
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Login should be done through Supabase client - use signInWithPassword() method",
			"details": "The JWT token from Supabase should be included in the Authorization header for subsequent requests",
		},
	})
}

// Search handles GET /api/v1/users/search
func (h *UserHandler) Search(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(401, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "User not authenticated",
			},
		})
		return
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "MISSING_QUERY",
				"message": "Search query parameter 'q' is required",
			},
		})
		return
	}

	profiles, err := h.service.Search(c.Request.Context(), query, userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to search users")
		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to search users",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"users": profiles,
		},
	})
}

// GetProfile handles GET /api/v1/users/me
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(401, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "User not authenticated",
			},
		})
		return
	}

	profile, err := h.service.GetProfile(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Failed to get profile")
		c.JSON(404, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "PROFILE_NOT_FOUND",
				"message": "Profile not found",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"profile": profile,
		},
	})
}

// UpdateProfile handles PUT /api/v1/users/me
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(401, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "User not authenticated",
			},
		})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_INPUT",
				"message": "Invalid request body",
				"details": err.Error(),
			},
		})
		return
	}

	// Validate allowed fields
	allowedFields := map[string]bool{
		"full_name":        true,
		"avatar_url":       true,
		"bio":              true,
		"major":            true,
		"graduation_year":  true,
		"location_sharing": true,
		"push_token":       true,
	}

	for key := range updates {
		if !allowedFields[key] {
			c.JSON(400, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_FIELD",
					"message": "Field '" + key + "' cannot be updated",
				},
			})
			return
		}
	}

	if err := h.service.UpdateProfile(c.Request.Context(), userID, updates); err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Failed to update profile")
		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to update profile",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"message": "Profile updated successfully",
		},
	})
}

