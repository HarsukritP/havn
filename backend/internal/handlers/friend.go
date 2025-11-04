package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/services"
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
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Get friends not yet implemented",
		},
	})
}

// SendRequest handles POST /api/v1/friends/request
func (h *FriendHandler) SendRequest(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Send friend request not yet implemented",
		},
	})
}

// RespondToRequest handles POST /api/v1/friends/respond
func (h *FriendHandler) RespondToRequest(c *gin.Context) {
	// TODO: Implement
	c.JSON(501, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "Respond to friend request not yet implemented",
		},
	})
}

