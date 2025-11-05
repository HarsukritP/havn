package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/harrypall/havn-backend/internal/handlers"
	"github.com/harrypall/havn-backend/internal/middleware"
	"github.com/harrypall/havn-backend/internal/services"
	"github.com/harrypall/havn-backend/pkg/database"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Initialize logger
	zerolog.TimeFieldFormat = time.RFC3339
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found, using environment variables")
	}

	// Get environment
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Info().Str("env", env).Str("port", port).Msg("Starting havn backend")

	// Initialize database
	db, err := database.NewDatabase(context.Background())
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	log.Info().Msg("Database connection established")

	// Initialize Auth0 JWT verification
	if err := middleware.InitAuth0(); err != nil {
		log.Fatal().Err(err).Msg("Failed to initialize Auth0")
	}
	log.Info().Msg("Auth0 JWT verification initialized")

	// Initialize services
	spotService := services.NewSpotService(db)
	occupancyService := services.NewOccupancyService(db)
	userService := services.NewUserService(db)
	friendService := services.NewFriendService(db)
	spotSaveService := services.NewSpotSaveService(db)

	// Initialize handlers
	spotHandler := handlers.NewSpotHandler(spotService)
	occupancyHandler := handlers.NewOccupancyHandler(occupancyService)
	userHandler := handlers.NewUserHandler(userService)
	friendHandler := handlers.NewFriendHandler(friendService)
	spotSaveHandler := handlers.NewSpotSaveHandler(spotSaveService)

	// Set up Gin
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORS())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "havn backend is running",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Public routes
		auth := api.Group("/auth")
		{
			auth.POST("/signup", userHandler.Signup)
			auth.POST("/login", userHandler.Login)
		}

		// Protected routes (require Auth0 authentication)
		protected := api.Group("")
		protected.Use(middleware.Auth0Middleware())
		{
			// Spots
			spots := protected.Group("/spots")
			{
				spots.GET("", spotHandler.GetSpots)
				spots.GET("/:id", spotHandler.GetSpotByID)
			}

			// Occupancy
			occupancy := protected.Group("/occupancy")
			{
				occupancy.POST("/checkin", occupancyHandler.CheckIn)
				occupancy.POST("/checkout", occupancyHandler.CheckOut)
			}

			// Users
			users := protected.Group("/users")
			{
				users.GET("/search", userHandler.Search)
				users.GET("/me", userHandler.GetProfile)
				users.PUT("/me", userHandler.UpdateProfile)
			}

			// Friends
			friends := protected.Group("/friends")
			{
				friends.GET("", friendHandler.GetFriends)
				friends.POST("/request", friendHandler.SendRequest)
				friends.POST("/respond", friendHandler.RespondToRequest)
			}

			// Spot saves
			spotSaves := protected.Group("/spot-saves")
			{
				spotSaves.GET("", spotSaveHandler.GetRequests)
				spotSaves.POST("/request", spotSaveHandler.CreateRequest)
				spotSaves.POST("/respond", spotSaveHandler.Respond)
			}
		}
	}

	// Start server
	addr := fmt.Sprintf(":%s", port)
	log.Info().Str("address", addr).Msg("Server starting")
	if err := router.Run(addr); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}

