package handlers

import (
	"net/http"
	"time"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// HealthCheck returns the health status of the service
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: models.HealthCheckResponse{
			Status:  "healthy",
			Version: "1.0.0",
			Services: map[string]string{
				"database": "healthy",
				"redis":    "healthy",
			},
		},
	})
}

