package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/middleware"
	"github.com/harrypall/havn-backend/internal/services"
	"github.com/rs/zerolog/log"
)

// OccupancyHandler handles occupancy-related HTTP requests
type OccupancyHandler struct {
	service *services.OccupancyService
}

// NewOccupancyHandler creates a new occupancy handler
func NewOccupancyHandler(service *services.OccupancyService) *OccupancyHandler {
	return &OccupancyHandler{service: service}
}

// CheckInRequest represents the check-in request body
type CheckInRequest struct {
	SpotID           string  `json:"spot_id" binding:"required"`
	Latitude         float64 `json:"latitude" binding:"required"`
	Longitude        float64 `json:"longitude" binding:"required"`
	LocationAccuracy float64 `json:"location_accuracy"`
}

// CheckIn handles POST /api/v1/occupancy/checkin
func (h *OccupancyHandler) CheckIn(c *gin.Context) {
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

	var req CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
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

	// Validate coordinates
	if req.Latitude < -90 || req.Latitude > 90 {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_LATITUDE",
				"message": "Latitude must be between -90 and 90",
			},
		})
		return
	}

	if req.Longitude < -180 || req.Longitude > 180 {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_LONGITUDE",
				"message": "Longitude must be between -180 and 180",
			},
		})
		return
	}

	result, err := h.service.CheckIn(
		c.Request.Context(),
		userID,
		req.SpotID,
		req.Latitude,
		req.Longitude,
		req.LocationAccuracy,
	)

	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Str("spot_id", req.SpotID).Msg("Check-in failed")
		
		// Return appropriate error based on the error message
		if err.Error() == "user already checked in at another location" {
			c.JSON(400, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "ALREADY_CHECKED_IN",
					"message": err.Error(),
				},
			})
			return
		}

		if err.Error() == "spot not found" {
			c.JSON(404, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "SPOT_NOT_FOUND",
					"message": "Spot not found",
				},
			})
			return
		}

		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "CHECKIN_FAILED",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data":    result,
	})
}

// CheckOut handles POST /api/v1/occupancy/checkout
func (h *OccupancyHandler) CheckOut(c *gin.Context) {
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

	result, err := h.service.CheckOut(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Check-out failed")
		
		if err.Error() == "no active check-in found" {
			c.JSON(404, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NO_ACTIVE_CHECKIN",
					"message": "No active check-in found",
				},
			})
			return
		}

		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "CHECKOUT_FAILED",
				"message": "Failed to check out",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data":    result,
	})
}

