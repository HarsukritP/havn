package handlers

import (
	"net/http"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/HarsukritP/havn/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type SpotHandler struct {
	spotService *services.SpotService
}

func NewSpotHandler(spotService *services.SpotService) *SpotHandler {
	return &SpotHandler{spotService: spotService}
}

// GetSpots retrieves all spots with optional filtering
func (h *SpotHandler) GetSpots(c *gin.Context) {
	var params models.GetSpotsParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid query parameters",
			Code:    "VALIDATION_ERROR",
		})
		return
	}

	spots, err := h.spotService.GetSpots(c.Request.Context(), &params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch spots",
			Code:    "INTERNAL_ERROR",
		})
		return
	}

	// Convert spots to include structured amenities
	spotsWithAmenities := make([]map[string]interface{}, len(spots))
	for i, spot := range spots {
		spotsWithAmenities[i] = spot.WithAmenities()
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: gin.H{
			"spots": spotsWithAmenities,
			"count": len(spots),
		},
	})
}

// GetNearbySpots retrieves spots near a location
func (h *SpotHandler) GetNearbySpots(c *gin.Context) {
	var params models.GetSpotsParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid query parameters",
			Code:    "VALIDATION_ERROR",
		})
		return
	}

	if params.Latitude == nil || params.Longitude == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Latitude and longitude are required",
			Code:    "VALIDATION_ERROR",
		})
		return
	}

	spots, err := h.spotService.GetSpots(c.Request.Context(), &params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch nearby spots",
			Code:    "INTERNAL_ERROR",
		})
		return
	}

	spotsWithAmenities := make([]map[string]interface{}, len(spots))
	for i, spot := range spots {
		spotsWithAmenities[i] = spot.WithAmenities()
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: gin.H{
			"spots": spotsWithAmenities,
			"count": len(spots),
		},
	})
}

// GetSpotByID retrieves a single spot by ID
func (h *SpotHandler) GetSpotByID(c *gin.Context) {
	spotID := c.Param("id")

	spot, err := h.spotService.GetSpotByID(c.Request.Context(), spotID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "Spot not found",
			Code:    "NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: gin.H{
			"spot": spot.WithAmenities(),
		},
	})
}

// UpdateSpotAvailability handles spot availability updates
func (h *SpotHandler) UpdateSpotAvailability(c *gin.Context) {
	spotID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req models.UpdateSpotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid request format",
			Code:    "VALIDATION_ERROR",
			Details: err.Error(),
		})
		return
	}

	response, err := h.spotService.UpdateAvailability(c.Request.Context(), userID.(string), spotID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "INTERNAL_ERROR"

		// Check for specific errors
		if err.Error() == "spot not found" {
			status = http.StatusNotFound
			code = "NOT_FOUND"
		} else if len(err.Error()) > 30 && err.Error()[:30] == "you must be within 100m of the" {
			status = http.StatusUnprocessableEntity
			code = "GEOFENCE_VIOLATION"
		}

		c.JSON(status, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
			Code:    code,
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data:    response,
		Message: "Thanks for helping the community! +" + string(rune(response.Rewards.TotalPointsEarned+'0')) + " points",
	})
}

