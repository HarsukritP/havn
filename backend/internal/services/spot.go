package services

import (
	"context"
	"fmt"

	"github.com/harrypall/havn-backend/internal/models"
	"github.com/harrypall/havn-backend/pkg/database"
	"github.com/rs/zerolog/log"
)

// SpotService handles spot-related business logic
type SpotService struct {
	db *database.Database
}

// NewSpotService creates a new spot service
func NewSpotService(db *database.Database) *SpotService {
	return &SpotService{db: db}
}

// GetSpots retrieves spots with filters and proximity search
func (s *SpotService) GetSpots(ctx context.Context, lat, lon float64, radius int, spotType, availableOnly string) ([]models.Spot, error) {
	query := `
		SELECT 
			id,
			name,
			building_name,
			floor_number,
			ST_X(location::geometry) as longitude,
			ST_Y(location::geometry) as latitude,
			ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters,
			address,
			spot_type,
			capacity,
			current_occupancy,
			amenities,
			hours,
			photo_urls,
			is_verified,
			avg_rating,
			total_reviews,
			created_at,
			updated_at
		FROM spots
		WHERE ST_DWithin(
			location::geography,
			ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
			$3
		)
	`

	args := []interface{}{lon, lat, radius}
	argIndex := 4

	// Add spot type filter
	if spotType != "" && spotType != "all" {
		query += fmt.Sprintf(" AND spot_type = $%d", argIndex)
		args = append(args, spotType)
		argIndex++
	}

	// Add availability filter
	if availableOnly == "true" {
		query += " AND (current_occupancy::float / NULLIF(capacity, 0)::float) < 0.67"
	}

	query += " ORDER BY distance_meters LIMIT 100"

	rows, err := s.db.Pool.Query(ctx, query, args...)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query spots")
		return nil, fmt.Errorf("failed to query spots: %w", err)
	}
	defer rows.Close()

	var spots []models.Spot
	for rows.Next() {
		var spot models.Spot
		var amenities, hours []byte

		err := rows.Scan(
			&spot.ID,
			&spot.Name,
			&spot.BuildingName,
			&spot.FloorNumber,
			&spot.Longitude,
			&spot.Latitude,
			&spot.DistanceMeters,
			&spot.Address,
			&spot.SpotType,
			&spot.Capacity,
			&spot.CurrentOccupancy,
			&amenities,
			&hours,
			&spot.PhotoURLs,
			&spot.IsVerified,
			&spot.AvgRating,
			&spot.TotalReviews,
			&spot.CreatedAt,
			&spot.UpdatedAt,
		)
		if err != nil {
			log.Error().Err(err).Msg("Failed to scan spot")
			continue
		}

		// Parse JSONB fields
		if err := spot.Amenities.Scan(amenities); err != nil {
			log.Error().Err(err).Msg("Failed to parse amenities")
		}
		if err := spot.Hours.Scan(hours); err != nil {
			log.Error().Err(err).Msg("Failed to parse hours")
		}

		// Calculate occupancy status
		spot.CalculateOccupancyStatus()

		spots = append(spots, spot)
	}

	return spots, nil
}

// GetSpotByID retrieves a single spot by ID
func (s *SpotService) GetSpotByID(ctx context.Context, id string, userID string) (*models.Spot, error) {
	query := `
		SELECT 
			id,
			name,
			building_name,
			floor_number,
			ST_X(location::geometry) as longitude,
			ST_Y(location::geometry) as latitude,
			address,
			spot_type,
			capacity,
			current_occupancy,
			amenities,
			hours,
			photo_urls,
			is_verified,
			avg_rating,
			total_reviews,
			created_at,
			updated_at
		FROM spots
		WHERE id = $1
	`

	var spot models.Spot
	var amenities, hours []byte

	err := s.db.Pool.QueryRow(ctx, query, id).Scan(
		&spot.ID,
		&spot.Name,
		&spot.BuildingName,
		&spot.FloorNumber,
		&spot.Longitude,
		&spot.Latitude,
		&spot.Address,
		&spot.SpotType,
		&spot.Capacity,
		&spot.CurrentOccupancy,
		&amenities,
		&hours,
		&spot.PhotoURLs,
		&spot.IsVerified,
		&spot.AvgRating,
		&spot.TotalReviews,
		&spot.CreatedAt,
		&spot.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("spot not found: %w", err)
	}

	// Parse JSONB fields
	if err := spot.Amenities.Scan(amenities); err != nil {
		log.Error().Err(err).Msg("Failed to parse amenities")
	}
	if err := spot.Hours.Scan(hours); err != nil {
		log.Error().Err(err).Msg("Failed to parse hours")
	}

	// Calculate occupancy status
	spot.CalculateOccupancyStatus()

	// TODO: Get friends at this spot
	// This would require querying profiles and occupancy_logs

	return &spot, nil
}

