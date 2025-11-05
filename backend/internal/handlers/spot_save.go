package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/middleware"
	"github.com/harrypall/havn-backend/internal/services"
	"github.com/rs/zerolog/log"
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

	requests, err := h.service.GetRequests(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Failed to get spot save requests")
		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to retrieve spot save requests",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data":    requests,
	})
}

// CreateRequestBody represents the request body for creating a spot save request
type CreateRequestBody struct {
	SpotID  string `json:"spot_id" binding:"required"`
	SaverID string `json:"saver_id" binding:"required"`
	Message string `json:"message"`
}

// CreateRequest handles POST /api/v1/spot-saves/request
func (h *SpotSaveHandler) CreateRequest(c *gin.Context) {
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

	var req CreateRequestBody
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

	request, err := h.service.CreateRequest(
		c.Request.Context(),
		userID,
		req.SaverID,
		req.SpotID,
		req.Message,
	)

	if err != nil {
		log.Error().Err(err).
			Str("user_id", userID).
			Str("saver_id", req.SaverID).
			Str("spot_id", req.SpotID).
			Msg("Failed to create spot save request")

		// Handle specific error cases
		if err.Error() == "saver is not your friend" {
			c.JSON(400, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FRIENDS",
					"message": "You must be friends with the user to request a spot save",
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
				"code":    "REQUEST_FAILED",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"request_id": request.ID,
			"status":     request.Status,
			"expires_at": request.ExpiresAt,
		},
	})
}

// RespondBody represents the request body for responding to a spot save request
type RespondBody struct {
	RequestID string `json:"request_id" binding:"required"`
	Response  string `json:"response" binding:"required"` // "accepted" or "declined"
}

// Respond handles POST /api/v1/spot-saves/respond
func (h *SpotSaveHandler) Respond(c *gin.Context) {
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

	var req RespondBody
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

	// Validate response
	if req.Response != "accepted" && req.Response != "declined" {
		c.JSON(400, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_RESPONSE",
				"message": "Response must be 'accepted' or 'declined'",
			},
		})
		return
	}

	err = h.service.Respond(c.Request.Context(), req.RequestID, userID, req.Response)
	if err != nil {
		log.Error().Err(err).
			Str("user_id", userID).
			Str("request_id", req.RequestID).
			Msg("Failed to respond to spot save request")

		if err.Error() == "spot save request not found" {
			c.JSON(404, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": err.Error(),
				},
			})
			return
		}

		if err.Error() == "unauthorized: you are not the saver of this request" {
			c.JSON(403, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": err.Error(),
				},
			})
			return
		}

		if err.Error() == "request already responded or expired" || err.Error() == "request has expired" {
			c.JSON(400, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_REQUEST",
					"message": err.Error(),
				},
			})
			return
		}

		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to respond to spot save request",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"request_id": req.RequestID,
			"status":     req.Response,
		},
	})
}

