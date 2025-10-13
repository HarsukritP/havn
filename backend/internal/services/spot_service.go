package services

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"time"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const (
	MaxGeofenceDistance = 100.0 // meters
	EarthRadiusMeters   = 6371000.0
)

type SpotService struct {
	db    *sql.DB
	redis *redis.Client
}

func NewSpotService(db *sql.DB, redis *redis.Client) *SpotService {
	return &SpotService{
		db:    db,
		redis: redis,
	}
}

// GetSpots retrieves spots with optional geospatial filtering
func (s *SpotService) GetSpots(ctx context.Context, params *models.GetSpotsParams) ([]*models.Spot, error) {
	query := `
		SELECT id, name, description, address, latitude, longitude,
		       total_capacity, current_available, has_wifi, has_outlets, has_printer,
		       is_quiet_zone, is_outdoor, last_update_at, is_active, created_at, updated_at
		FROM study_spots
		WHERE is_active = true
	`
	args := []interface{}{}

	// Add geospatial filtering if lat/lng provided
	if params.Latitude != nil && params.Longitude != nil {
		// Using Haversine formula for distance calculation (simplified for query)
		// In production, use PostGIS: ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
		query += " ORDER BY created_at DESC"
	} else {
		query += " ORDER BY created_at DESC"
	}

	// Add pagination
	limit := 20
	if params.Limit != nil && *params.Limit > 0 && *params.Limit <= 100 {
		limit = *params.Limit
	}
	query += fmt.Sprintf(" LIMIT %d", limit)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query spots: %w", err)
	}
	defer rows.Close()

	var spots []*models.Spot
	for rows.Next() {
		spot := &models.Spot{}
		err := rows.Scan(
			&spot.ID, &spot.Name, &spot.Description, &spot.Address,
			&spot.Latitude, &spot.Longitude, &spot.TotalCapacity,
			&spot.CurrentAvailable, &spot.HasWifi, &spot.HasOutlets,
			&spot.HasPrinter, &spot.IsQuietZone, &spot.IsOutdoor,
			&spot.LastUpdateAt, &spot.IsActive, &spot.CreatedAt, &spot.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan spot: %w", err)
		}

		// Calculate distance if coordinates provided
		if params.Latitude != nil && params.Longitude != nil {
			distance := CalculateDistance(*params.Latitude, *params.Longitude, spot.Latitude, spot.Longitude)
			spot.DistanceMeters = &distance
		}

		// Calculate availability status and confidence score
		spot.AvailabilityStatus = s.calculateAvailabilityStatus(spot)
		spot.ConfidenceScore = s.calculateConfidenceScore(spot)

		spots = append(spots, spot)
	}

	return spots, nil
}

// GetSpotByID retrieves a single spot by ID
func (s *SpotService) GetSpotByID(ctx context.Context, spotID string) (*models.Spot, error) {
	spot := &models.Spot{}
	
	query := `
		SELECT id, name, description, address, latitude, longitude,
		       total_capacity, current_available, has_wifi, has_outlets, has_printer,
		       is_quiet_zone, is_outdoor, last_update_at, is_active, created_at, updated_at
		FROM study_spots
		WHERE id = $1 AND is_active = true
	`
	
	err := s.db.QueryRowContext(ctx, query, spotID).Scan(
		&spot.ID, &spot.Name, &spot.Description, &spot.Address,
		&spot.Latitude, &spot.Longitude, &spot.TotalCapacity,
		&spot.CurrentAvailable, &spot.HasWifi, &spot.HasOutlets,
		&spot.HasPrinter, &spot.IsQuietZone, &spot.IsOutdoor,
		&spot.LastUpdateAt, &spot.IsActive, &spot.CreatedAt, &spot.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("spot not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch spot: %w", err)
	}

	spot.AvailabilityStatus = s.calculateAvailabilityStatus(spot)
	spot.ConfidenceScore = s.calculateConfidenceScore(spot)

	return spot, nil
}

// UpdateAvailability submits a new availability update for a spot
func (s *SpotService) UpdateAvailability(ctx context.Context, userID string, spotID string, req *models.UpdateSpotRequest) (*models.UpdateResponse, error) {
	// Get spot details
	spot, err := s.GetSpotByID(ctx, spotID)
	if err != nil {
		return nil, err
	}

	// Validate seats available doesn't exceed capacity
	if req.SeatsAvailable > spot.TotalCapacity {
		return nil, fmt.Errorf("seats available (%d) cannot exceed total capacity (%d)", req.SeatsAvailable, spot.TotalCapacity)
	}

	// Calculate distance from spot (geofencing)
	distance := CalculateDistance(req.UserLatitude, req.UserLongitude, spot.Latitude, spot.Longitude)
	if distance > MaxGeofenceDistance {
		return nil, fmt.Errorf("you must be within 100m of the spot to submit an update (you are %.0fm away)", distance)
	}

	// Create spot update
	updateID := uuid.New().String()
	now := time.Now()

	updateQuery := `
		INSERT INTO spot_updates (id, spot_id, user_id, seats_available, noise_level, photo_url,
		                         user_latitude, user_longitude, distance_from_spot, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	
	_, err = s.db.ExecContext(ctx, updateQuery,
		updateID, spotID, userID, req.SeatsAvailable, req.NoiseLevel, req.PhotoURL,
		req.UserLatitude, req.UserLongitude, distance, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create update: %w", err)
	}

	// Update spot's current availability
	_, err = s.db.ExecContext(ctx,
		"UPDATE study_spots SET current_available = $1, last_update_at = $2, updated_at = $3 WHERE id = $4",
		req.SeatsAvailable, now, now, spotID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update spot: %w", err)
	}

	// Award points to user
	basePoints := 5
	accuracyBonus := 0 // TODO: Calculate based on consistency with recent updates
	totalPoints := basePoints + accuracyBonus

	// Update user points and streak
	userQuery := `
		UPDATE users 
		SET total_points = total_points + $1,
		    updated_at = $2
		WHERE id = $3
	`
	_, err = s.db.ExecContext(ctx, userQuery, totalPoints, now, userID)
	if err != nil {
		// Log but don't fail the update
		fmt.Printf("Warning: failed to award points: %v\n", err)
	}

	// Get updated user total points
	var userTotalPoints int
	err = s.db.QueryRowContext(ctx, "SELECT total_points FROM users WHERE id = $1", userID).Scan(&userTotalPoints)
	if err != nil {
		userTotalPoints = totalPoints // Fallback
	}

	// Calculate new availability status
	availabilityStatus := s.calculateAvailabilityStatusFromSeats(req.SeatsAvailable, spot.TotalCapacity)
	confidenceScore := 95.0 // High confidence for fresh update

	// Build response
	response := &models.UpdateResponse{
		Update: &models.SpotUpdate{
			ID:               updateID,
			SpotID:           spotID,
			UserID:           userID,
			SeatsAvailable:   req.SeatsAvailable,
			NoiseLevel:       req.NoiseLevel,
			PhotoURL:         req.PhotoURL,
			UserLatitude:     req.UserLatitude,
			UserLongitude:    req.UserLongitude,
			DistanceFromSpot: distance,
			ConfidenceScore:  confidenceScore,
			CreatedAt:        now,
		},
		Rewards: &models.RewardsData{
			PointsEarned:      basePoints,
			AccuracyBonus:     accuracyBonus,
			TotalPointsEarned: totalPoints,
			UserTotalPoints:   userTotalPoints,
			StreakUpdated:     false, // TODO: Implement streak logic
			CurrentStreak:     0,     // TODO: Get from user
		},
		SpotUpdated: &models.SpotStatusUpdate{
			CurrentAvailable:   req.SeatsAvailable,
			AvailabilityStatus: availabilityStatus,
			ConfidenceScore:    confidenceScore,
		},
	}

	return response, nil
}

// CalculateDistance calculates the distance between two coordinates in meters using Haversine formula
func CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	// Convert to radians
	lat1Rad := lat1 * math.Pi / 180
	lon1Rad := lon1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lon2Rad := lon2 * math.Pi / 180

	// Haversine formula
	dLat := lat2Rad - lat1Rad
	dLon := lon2Rad - lon1Rad

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dLon/2)*math.Sin(dLon/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	distance := EarthRadiusMeters * c

	return distance
}

// calculateAvailabilityStatus determines the availability status based on current data
func (s *SpotService) calculateAvailabilityStatus(spot *models.Spot) string {
	if spot.CurrentAvailable == nil {
		return "unknown"
	}

	percent := float64(*spot.CurrentAvailable) / float64(spot.TotalCapacity) * 100

	if percent > 50 {
		return "available"
	} else if percent > 20 {
		return "low"
	}
	return "full"
}

// calculateAvailabilityStatusFromSeats calculates status from seat numbers
func (s *SpotService) calculateAvailabilityStatusFromSeats(available, capacity int) string {
	percent := float64(available) / float64(capacity) * 100

	if percent > 50 {
		return "available"
	} else if percent > 20 {
		return "low"
	}
	return "full"
}

// calculateConfidenceScore calculates how confident we are in the current availability data
func (s *SpotService) calculateConfidenceScore(spot *models.Spot) float64 {
	if spot.LastUpdateAt == nil {
		return 0.0
	}

	// Calculate time since last update
	minutesSinceUpdate := time.Since(*spot.LastUpdateAt).Minutes()

	if minutesSinceUpdate < 5 {
		return 100.0
	} else if minutesSinceUpdate < 15 {
		return 80.0
	} else if minutesSinceUpdate < 30 {
		return 60.0
	} else if minutesSinceUpdate < 60 {
		return 40.0
	}
	return 20.0
}

