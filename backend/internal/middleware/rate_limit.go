package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RateLimiter middleware limits requests per IP
func RateLimiter(redis *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// If Redis is not available, skip rate limiting (MVP mode)
		if redis == nil {
			c.Next()
			return
		}

		ip := c.ClientIP()
		key := fmt.Sprintf("rate_limit:%s", ip)

		// Get current count
		count, err := redis.Incr(c.Request.Context(), key).Result()
		if err != nil {
			// If Redis fails, allow the request (fail open)
			c.Next()
			return
		}

		// Set expiry on first request
		if count == 1 {
			redis.Expire(c.Request.Context(), key, time.Minute)
		}

		// Check limit (100 requests per minute)
		if count > 100 {
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Success: false,
				Error:   "Rate limit exceeded. Please try again later.",
				Code:    "RATE_LIMIT_EXCEEDED",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

