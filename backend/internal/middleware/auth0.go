package middleware

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

// Auth0Config holds Auth0 configuration
type Auth0Config struct {
	Domain   string
	Audience string
}

var auth0KeySet jwk.Set

// InitAuth0 initializes Auth0 JWT verification
func InitAuth0() error {
	domain := os.Getenv("AUTH0_DOMAIN")
	if domain == "" {
		return fmt.Errorf("AUTH0_DOMAIN not set")
	}

	// Fetch JWKS from Auth0
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	jwksURL := fmt.Sprintf("https://%s/.well-known/jwks.json", domain)
	set, err := jwk.Fetch(ctx, jwksURL)
	if err != nil {
		return fmt.Errorf("failed to fetch JWKS: %w", err)
	}

	auth0KeySet = set
	return nil
}

// Auth0Middleware validates Auth0 JWT tokens
func Auth0Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "MISSING_AUTH",
					"message": "Authorization header required",
				},
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_AUTH_FORMAT",
					"message": "Authorization header must be in format: Bearer <token>",
				},
			})
			c.Abort()
			return
		}

		// Parse and validate JWT
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify signing method is RS256
			if token.Method.Alg() != "RS256" {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Get the key ID from token header
			kid, ok := token.Header["kid"].(string)
			if !ok {
				return nil, fmt.Errorf("kid header not found")
			}

			// Look up the key
			key, ok := auth0KeySet.LookupKeyID(kid)
			if !ok {
				return nil, fmt.Errorf("key %v not found", kid)
			}

			// Convert to crypto public key
			var rawKey interface{}
			if err := key.Raw(&rawKey); err != nil {
				return nil, fmt.Errorf("failed to get raw key: %w", err)
			}

			return rawKey, nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_TOKEN",
					"message": "Invalid or expired token",
					"details": err.Error(),
				},
			})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_TOKEN",
					"message": "Token is not valid",
				},
			})
			c.Abort()
			return
		}

		// Extract and validate claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_CLAIMS",
					"message": "Invalid token claims",
				},
			})
			c.Abort()
			return
		}

		// Validate audience
		audience := os.Getenv("AUTH0_AUDIENCE")
		if audience == "" {
			audience = "https://havn-api"
		}

		if !validateAudience(claims, audience) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INVALID_AUDIENCE",
					"message": "Token audience does not match",
				},
			})
			c.Abort()
			return
		}

		// Extract user ID from "sub" claim
		userID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "MISSING_USER_ID",
					"message": "User ID not found in token",
				},
			})
			c.Abort()
			return
		}

		// Store user ID and claims in context
		c.Set("user_id", userID)
		c.Set("claims", claims)

		c.Next()
	}
}

// validateAudience checks if the token audience matches the expected audience
func validateAudience(claims jwt.MapClaims, expectedAudience string) bool {
	aud, ok := claims["aud"]
	if !ok {
		return false
	}

	switch v := aud.(type) {
	case string:
		return v == expectedAudience
	case []interface{}:
		for _, a := range v {
			if audStr, ok := a.(string); ok && audStr == expectedAudience {
				return true
			}
		}
	}

	return false
}

