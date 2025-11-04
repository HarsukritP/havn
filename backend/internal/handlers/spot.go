package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/middleware"
	"github.com/harrypall/havn-backend/internal/services"
	"github.com/rs/zerolog/log"
)

// SpotHandler handles spot-related HTTP requests
type SpotHandler struct {
	service *services.SpotService
}

// NewSpotHandler creates a new spot handler
func NewSpotHandler(service *services.SpotService) *SpotHandler {
	return &SpotHandler{service: service}
}

// GetSpots handles GET /api/v1/spots
func (h *SpotHandler) GetSpots(c *gin.Context) {
	// Get query parameters
	latStr := c.Query("lat")
	lonStr := c.Query("lon")
	radiusStr := c.DefaultQuery("radius", "2000")
	spotType := c.DefaultQuery("type", "all")
	availableOnly := c.DefaultQuery("available_only", "false")

	// Validate required parameters
	if latStr == "" || lonStr == "" {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "MISSING_PARAMETERS",
				"message": "lat and lon query parameters are required",
			},
		})
		return
	}

	// Parse parameters
	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_LATITUDE",
				"message": "Invalid latitude value",
			},
		})
		return
	}

	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_LONGITUDE",
				"message": "Invalid longitude value",
			},
		})
		return
	}

	radius, err := strconv.Atoi(radiusStr)
	if err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_RADIUS",
				"message": "Invalid radius value",
			},
		})
		return
	}

	// Get spots
	spots, err := h.service.GetSpots(c.Request.Context(), lat, lon, radius, spotType, availableOnly)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get spots")
		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to retrieve spots",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"spots": spots,
			"count": len(spots),
		},
	})
}

// GetSpotByID handles GET /api/v1/spots/:id
func (h *SpotHandler) GetSpotByID(c *gin.Context) {
	spotID := c.Param("id")
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

	spot, err := h.service.GetSpotByID(c.Request.Context(), spotID, userID)
	if err != nil {
		log.Error().Err(err).Str("spot_id", spotID).Msg("Failed to get spot")
		c.JSON(404, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SPOT_NOT_FOUND",
				"message": "Spot not found",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"spot": spot,
		},
	})
}

