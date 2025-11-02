package main

import (
	"context"
	"database/sql"
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

	// Run database migrations on startup (temporary for initial setup)
	log.Println("Running database migrations...")
	runMigrations(db)
	log.Println("✓ Database migrations complete")

	// Initialize Redis client (optional for MVP)
	var redisClient *redis.Client
	redisAddr := getEnv("REDIS_HOST", "") + ":" + getEnv("REDIS_PORT", "6379")
	
	// Only try to connect if REDIS_HOST is explicitly set
	if getEnv("REDIS_HOST", "") != "" {
		redisClient = redis.NewClient(&redis.Options{
			Addr:     redisAddr,
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       0,
		})

		// Test Redis connection
		ctx := context.Background()
		if err := redisClient.Ping(ctx).Err(); err != nil {
			log.Printf("⚠️  Redis connection failed: %v", err)
			log.Println("⚠️  Running without Redis (caching and WebSocket pub/sub disabled)")
			redisClient = nil
		} else {
			defer redisClient.Close()
			log.Println("✓ Connected to Redis")
		}
	} else {
		log.Println("⚠️  REDIS_HOST not set, running without Redis (MVP mode)")
	}

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

// runMigrations runs database setup migrations (temporary for initial deployment)
func runMigrations(db *sql.DB) {
	migrations := []string{
		`CREATE EXTENSION IF NOT EXISTS postgis;`,
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			full_name VARCHAR(255) NOT NULL,
			total_points INTEGER DEFAULT 0,
			reputation_score DECIMAL(3,2) DEFAULT 0.5,
			current_streak INTEGER DEFAULT 0,
			longest_streak INTEGER DEFAULT 0,
			email_verified BOOLEAN DEFAULT FALSE,
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			last_login_at TIMESTAMP WITH TIME ZONE
		);`,
		`CREATE TABLE IF NOT EXISTS study_spots (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			description TEXT,
			address VARCHAR(500),
			latitude DECIMAL(10, 8) NOT NULL,
			longitude DECIMAL(11, 8) NOT NULL,
			location GEOGRAPHY(POINT, 4326),
			total_capacity INTEGER NOT NULL DEFAULT 50,
			current_available INTEGER,
			spot_type VARCHAR(50) DEFAULT 'library',
			noise_level VARCHAR(20),
			has_wifi BOOLEAN DEFAULT TRUE,
			has_outlets BOOLEAN DEFAULT TRUE,
			has_food BOOLEAN DEFAULT FALSE,
			hours_open VARCHAR(255),
			university_verified BOOLEAN DEFAULT FALSE,
			is_active BOOLEAN DEFAULT TRUE,
			confidence_score DECIMAL(3,2) DEFAULT 0.5,
			last_update_at TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_study_spots_location ON study_spots USING GIST(location);`,
		`CREATE OR REPLACE FUNCTION sync_location_from_lat_lng()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;`,
		`CREATE TRIGGER IF NOT EXISTS trigger_sync_location_from_lat_lng
		BEFORE INSERT OR UPDATE ON study_spots
		FOR EACH ROW
		EXECUTE FUNCTION sync_location_from_lat_lng();`,
	}

	for i, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			log.Printf("Warning: Migration %d failed (may already exist): %v", i+1, err)
		}
	}
}

