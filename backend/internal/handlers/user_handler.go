package handlers

import (
	"net/http"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/HarsukritP/havn/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetCurrentUser retrieves the currently authenticated user's profile
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")

	user, err := h.userService.GetUserByID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "User not found",
			Code:    "NOT_FOUND",
		})
		return
	}

	stats, err := h.userService.GetUserStats(c.Request.Context(), userID.(string))
	if err != nil {
		stats = &models.UserStats{} // Empty stats on error
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: gin.H{
			"user":  user,
			"stats": stats,
		},
	})
}

// UpdateCurrentUser updates the current user's profile
func (h *UserHandler) UpdateCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid request format",
			Code:    "VALIDATION_ERROR",
		})
		return
	}

	user, err := h.userService.UpdateUser(c.Request.Context(), userID.(string), &req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "INTERNAL_ERROR"

		if err.Error() == "email already in use" {
			status = http.StatusConflict
			code = "ALREADY_EXISTS"
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
		Data: gin.H{
			"user": user,
		},
		Message: "Profile updated successfully",
	})
}

// GetLeaderboard retrieves the leaderboard
func (h *UserHandler) GetLeaderboard(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	period := c.DefaultQuery("period", "weekly")
	limit := 10

	entries, err := h.userService.GetLeaderboard(c.Request.Context(), period, limit, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch leaderboard",
			Code:    "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: gin.H{
			"leaderboard": entries,
			"period":      period,
		},
	})
}

// GetUserStats retrieves stats for any user (public)
func (h *UserHandler) GetUserStats(c *gin.Context) {
	targetUserID := c.Param("id")

	user, err := h.userService.GetUserByID(c.Request.Context(), targetUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "User not found",
			Code:    "NOT_FOUND",
		})
		return
	}

	stats, err := h.userService.GetUserStats(c.Request.Context(), targetUserID)
	if err != nil {
		stats = &models.UserStats{}
	}

	// Return limited public info
	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: gin.H{
			"user": gin.H{
				"id":               user.ID,
				"full_name":        user.FullName, // TODO: Obscure
				"reputation_score": user.ReputationScore,
				"joined_at":        user.CreatedAt,
			},
			"stats": gin.H{
				"total_check_ins":        stats.TotalCheckIns,
				"current_streak":         user.CurrentStreak,
				"rank_percentile":        stats.RankPercentile,
				"achievements_unlocked":  stats.AchievementsUnlocked,
			},
		},
	})
}

