package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/HarsukritP/havn/backend/internal/database"
	"github.com/HarsukritP/havn/backend/internal/handlers"
	"github.com/HarsukritP/havn/backend/internal/middleware"
	"github.com/HarsukritP/havn/backend/internal/services"
	"github.com/HarsukritP/havn/backend/internal/websocket"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("✓ Connected to PostgreSQL database")

	// Initialize Redis client
	redisClient := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_HOST", "localhost") + ":" + getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	// Test Redis connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
	defer redisClient.Close()

	log.Println("✓ Connected to Redis")

	// Initialize services
	authService := services.NewAuthService(db, redisClient)
	spotService := services.NewSpotService(db, redisClient)
	userService := services.NewUserService(db)

	// Initialize WebSocket hub
	hub := websocket.NewHub(redisClient)
	go hub.Run()

	log.Println("✓ WebSocket hub started")

	// Set Gin mode
	if getEnv("GIN_MODE", "debug") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Gin router
	router := gin.Default()

	// Global middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger())
	router.Use(middleware.RateLimiter(redisClient))

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	spotHandler := handlers.NewSpotHandler(spotService)
	userHandler := handlers.NewUserHandler(userService)
	wsHandler := handlers.NewWebSocketHandler(hub)

	// API routes
	api := router.Group("/api")
	{
		// Health check (no auth required)
		api.GET("/health", handlers.HealthCheck)

		// Auth routes (no auth required)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", middleware.AuthRequired(authService), authHandler.Logout)
		}

		// Spot routes (auth required)
		spots := api.Group("/spots")
		spots.Use(middleware.AuthRequired(authService))
		{
			spots.GET("", spotHandler.GetSpots)
			spots.GET("/nearby", spotHandler.GetNearbySpots)
			spots.GET("/:id", spotHandler.GetSpotByID)
			spots.POST("/:id/update", spotHandler.UpdateSpotAvailability)
		}

		// User routes (auth required)
		users := api.Group("/users")
		users.Use(middleware.AuthRequired(authService))
		{
			users.GET("/me", userHandler.GetCurrentUser)
			users.PATCH("/me", userHandler.UpdateCurrentUser)
			users.GET("/leaderboard", userHandler.GetLeaderboard)
			users.GET("/:id/stats", userHandler.GetUserStats)
		}
	}

	// WebSocket endpoint (auth happens in handler)
	router.GET("/ws", wsHandler.HandleWebSocket)

	// Server configuration
	port := getEnv("PORT", "8080")
	srv := &http.Server{
		Addr:           ":" + port,
		Handler:        router,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Start server in goroutine
	go func() {
		log.Printf("🚀 Server starting on port %s\n", port)
		log.Printf("📍 Health check: http://localhost:%s/api/health\n", port)
		log.Printf("🔌 WebSocket: ws://localhost:%s/ws\n", port)
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v\n", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("\n🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("✓ Server exited gracefully")
}

// getEnv retrieves an environment variable with a fallback default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

