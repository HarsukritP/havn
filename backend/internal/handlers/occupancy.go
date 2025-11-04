package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/services"
)

// OccupancyHandler handles occupancy-related HTTP requests
type OccupancyHandler struct {
	service *services.OccupancyService
}

// NewOccupancyHandler creates a new occupancy handler
func NewOccupancyHandler(service *services.OccupancyService) *OccupancyHandler {
	return &OccupancyHandler{service: service}
}

// CheckIn handles POST /api/v1/occupancy/checkin
func (h *OccupancyHandler) CheckIn(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Check-in not yet implemented",
		},
	})
}

// CheckOut handles POST /api/v1/occupancy/checkout
func (h *OccupancyHandler) CheckOut(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Check-out not yet implemented",
		},
	})
}

