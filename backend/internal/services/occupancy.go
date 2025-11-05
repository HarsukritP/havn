package services

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/harrypall/havn-backend/pkg/database"
	"github.com/jackc/pgx/v5"
	"github.com/rs/zerolog/log"
)

// OccupancyService handles occupancy tracking
type OccupancyService struct {
	db *database.Database
}

// NewOccupancyService creates a new occupancy service
func NewOccupancyService(db *database.Database) *OccupancyService {
	return &OccupancyService{db: db}
}

// CheckInResponse represents the response from a check-in operation
type CheckInResponse struct {
	OccupancyLogID  string    `json:"occupancy_log_id"`
	Spot            SpotInfo  `json:"spot"`
	CheckedInAt     time.Time `json:"checked_in_at"`
	AutoCheckoutAt  time.Time `json:"auto_checkout_at"`
}

// SpotInfo represents basic spot information
type SpotInfo struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	CurrentOccupancy int    `json:"current_occupancy"`
}

// CheckOut handles user check-in to a spot
func (s *OccupancyService) CheckIn(ctx context.Context, userID, spotID string, lat, lon, accuracy float64) (*CheckInResponse, error) {
	// Start transaction
	tx, err := s.db.Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Check if user is already checked in elsewhere
	var existingCheckIn string
	err = tx.QueryRow(ctx, `
		SELECT id FROM occupancy_logs 
		WHERE user_id = $1 AND checked_out_at IS NULL
		LIMIT 1
	`, userID).Scan(&existingCheckIn)
	
	if err == nil {
		return nil, fmt.Errorf("user already checked in at another location")
	} else if err != pgx.ErrNoRows {
		return nil, fmt.Errorf("failed to check existing check-in: %w", err)
	}

	// 2. Validate distance to spot (< 200m)
	var spotLat, spotLon float64
	var spotName string
	err = tx.QueryRow(ctx, `
		SELECT 
			ST_Y(location::geometry) as latitude,
			ST_X(location::geometry) as longitude,
			name
		FROM spots
		WHERE id = $1
	`, spotID).Scan(&spotLat, &spotLon, &spotName)
	
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("spot not found")
		}
		return nil, fmt.Errorf("failed to get spot location: %w", err)
	}

	// Calculate distance using Haversine formula
	distance := calculateDistance(lat, lon, spotLat, spotLon)
	if distance > 200 {
		return nil, fmt.Errorf("too far from spot (%.0fm away, must be within 200m)", distance)
	}

	// 3. Insert occupancy_log
	var occupancyLogID string
	err = tx.QueryRow(ctx, `
		INSERT INTO occupancy_logs (user_id, spot_id, status, location_accuracy)
		VALUES ($1, $2, 'checked_in', $3)
		RETURNING id
	`, userID, spotID, accuracy).Scan(&occupancyLogID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create occupancy log: %w", err)
	}

	// 4. Update spots.current_occupancy
	var newOccupancy int
	err = tx.QueryRow(ctx, `
		UPDATE spots
		SET current_occupancy = current_occupancy + 1
		WHERE id = $1
		RETURNING current_occupancy
	`, spotID).Scan(&newOccupancy)
	
	if err != nil {
		return nil, fmt.Errorf("failed to update spot occupancy: %w", err)
	}

	// 5. Update profiles.current_spot_id and checked_in_at
	_, err = tx.Exec(ctx, `
		UPDATE profiles
		SET current_spot_id = $1, checked_in_at = NOW()
		WHERE id = $2
	`, spotID, userID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Info().
		Str("user_id", userID).
		Str("spot_id", spotID).
		Float64("distance", distance).
		Msg("User checked in successfully")

	// Default auto-checkout after 4 hours
	autoCheckoutAt := time.Now().Add(4 * time.Hour)

	return &CheckInResponse{
		OccupancyLogID: occupancyLogID,
		Spot: SpotInfo{
			ID:               spotID,
			Name:             spotName,
			CurrentOccupancy: newOccupancy,
		},
		CheckedInAt:    time.Now(),
		AutoCheckoutAt: autoCheckoutAt,
	}, nil
}

// CheckOutResponse represents the response from a check-out operation
type CheckOutResponse struct {
	Spot            SpotInfo  `json:"spot"`
	CheckedOutAt    time.Time `json:"checked_out_at"`
	SessionDuration string    `json:"session_duration"`
}

// CheckOut handles user check-out from a spot
func (s *OccupancyService) CheckOut(ctx context.Context, userID string) (*CheckOutResponse, error) {
	// Start transaction
	tx, err := s.db.Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Find active check-in
	var occupancyLogID, spotID, spotName string
	var checkedInAt time.Time
	err = tx.QueryRow(ctx, `
		SELECT ol.id, ol.spot_id, ol.checked_in_at, s.name
		FROM occupancy_logs ol
		JOIN spots s ON s.id = ol.spot_id
		WHERE ol.user_id = $1 AND ol.checked_out_at IS NULL
		LIMIT 1
	`, userID).Scan(&occupancyLogID, &spotID, &checkedInAt, &spotName)
	
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("no active check-in found")
		}
		return nil, fmt.Errorf("failed to find active check-in: %w", err)
	}

	// Calculate session duration
	now := time.Now()
	duration := now.Sub(checkedInAt)

	// 2. Update occupancy_log
	_, err = tx.Exec(ctx, `
		UPDATE occupancy_logs
		SET checked_out_at = NOW(),
		    session_duration = $1,
		    status = 'checked_out'
		WHERE id = $2
	`, duration, occupancyLogID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to update occupancy log: %w", err)
	}

	// 3. Decrement spots.current_occupancy
	var newOccupancy int
	err = tx.QueryRow(ctx, `
		UPDATE spots
		SET current_occupancy = GREATEST(current_occupancy - 1, 0)
		WHERE id = $1
		RETURNING current_occupancy
	`, spotID).Scan(&newOccupancy)
	
	if err != nil {
		return nil, fmt.Errorf("failed to update spot occupancy: %w", err)
	}

	// 4. Clear profiles.current_spot_id
	_, err = tx.Exec(ctx, `
		UPDATE profiles
		SET current_spot_id = NULL, checked_in_at = NULL
		WHERE id = $1
	`, userID)
	
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Info().
		Str("user_id", userID).
		Str("spot_id", spotID).
		Dur("duration", duration).
		Msg("User checked out successfully")

	return &CheckOutResponse{
		Spot: SpotInfo{
			ID:               spotID,
			Name:             spotName,
			CurrentOccupancy: newOccupancy,
		},
		CheckedOutAt:    now,
		SessionDuration: formatDuration(duration),
	}, nil
}

// calculateDistance calculates the distance in meters between two lat/lon points
func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371000 // meters

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}

// formatDuration formats a duration as HH:MM:SS
func formatDuration(d time.Duration) string {
	hours := int(d.Hours())
	minutes := int(d.Minutes()) % 60
	seconds := int(d.Seconds()) % 60
	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
}

