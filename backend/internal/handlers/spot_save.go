package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/services"
)

// SpotSaveHandler handles spot save request-related HTTP requests
type SpotSaveHandler struct {
	service *services.SpotSaveService
}

// NewSpotSaveHandler creates a new spot save handler
func NewSpotSaveHandler(service *services.SpotSaveService) *SpotSaveHandler {
	return &SpotSaveHandler{service: service}
}

// GetRequests handles GET /api/v1/spot-saves
func (h *SpotSaveHandler) GetRequests(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Get spot save requests not yet implemented",
		},
	})
}

// CreateRequest handles POST /api/v1/spot-saves/request
func (h *SpotSaveHandler) CreateRequest(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Create spot save request not yet implemented",
		},
	})
}

// Respond handles POST /api/v1/spot-saves/respond
func (h *SpotSaveHandler) Respond(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Respond to spot save request not yet implemented",
		},
	})
}

