package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/middleware"
	"github.com/harrypall/havn-backend/internal/services"
	"github.com/rs/zerolog/log"
)

// FriendHandler handles friendship-related HTTP requests
type FriendHandler struct {
	service *services.FriendService
}

// NewFriendHandler creates a new friend handler
func NewFriendHandler(service *services.FriendService) *FriendHandler {
	return &FriendHandler{service: service}
}

// GetFriends handles GET /api/v1/friends
func (h *FriendHandler) GetFriends(c *gin.Context) {
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

	friends, err := h.service.GetFriends(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Failed to get friends")
		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to retrieve friends",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data":    friends,
	})
}

// FriendRequestBody represents the request body for sending a friend request
type FriendRequestBody struct {
	FriendID string `json:"friend_id" binding:"required"`
}

// SendRequest handles POST /api/v1/friends/request
func (h *FriendHandler) SendRequest(c *gin.Context) {
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

	var req FriendRequestBody
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

	friendship, err := h.service.SendRequest(c.Request.Context(), userID, req.FriendID)
	if err != nil {
		log.Error().Err(err).
			Str("user_id", userID).
			Str("friend_id", req.FriendID).
			Msg("Failed to send friend request")

		if err.Error() == "cannot send friend request to yourself" {
			c.JSON(400, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_REQUEST",
					"message": err.Error(),
				},
			})
			return
		}

		if err.Error() == "friendship already exists" {
			c.JSON(400, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "FRIENDSHIP_EXISTS",
					"message": "Friendship already exists",
				},
			})
			return
		}

		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to send friend request",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"friendship_id": friendship.ID,
			"status":        friendship.Status,
			"requested_at":  friendship.RequestedAt,
		},
	})
}

// RespondRequestBody represents the request body for responding to a friend request
type RespondRequestBody struct {
	FriendshipID string `json:"friendship_id" binding:"required"`
	Response     string `json:"response" binding:"required"` // "accepted" or "declined"
}

// RespondToRequest handles POST /api/v1/friends/respond
func (h *FriendHandler) RespondToRequest(c *gin.Context) {
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

	var req RespondRequestBody
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

	err = h.service.RespondToRequest(c.Request.Context(), req.FriendshipID, userID, req.Response)
	if err != nil {
		log.Error().Err(err).
			Str("user_id", userID).
			Str("friendship_id", req.FriendshipID).
			Msg("Failed to respond to friend request")

		if err.Error() == "friend request not found or already responded" {
			c.JSON(404, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": err.Error(),
				},
			})
			return
		}

		if err.Error() == "unauthorized: you are not the recipient of this request" {
			c.JSON(403, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": err.Error(),
				},
			})
			return
		}

		c.JSON(500, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "SERVER_ERROR",
				"message": "Failed to respond to friend request",
			},
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"data": gin.H{
			"friendship_id": req.FriendshipID,
			"status":        req.Response,
		},
	})
}

