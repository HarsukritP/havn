package services

import (
	"context"

	"github.com/harrypall/havn-backend/pkg/database"
)

// OccupancyService handles occupancy tracking
type OccupancyService struct {
	db *database.Database
}

// NewOccupancyService creates a new occupancy service
func NewOccupancyService(db *database.Database) *OccupancyService {
	return &OccupancyService{db: db}
}

// CheckIn handles user check-in to a spot
func (s *OccupancyService) CheckIn(ctx context.Context, userID, spotID string, lat, lon, accuracy float64) error {
	// TODO: Implement check-in logic
	// 1. Validate user not already checked in elsewhere
	// 2. Validate distance to spot (< 200m)
	// 3. Insert occupancy_log
	// 4. Update spots.current_occupancy
	// 5. Update profiles.current_spot_id
	return nil
}

// CheckOut handles user check-out from a spot
func (s *OccupancyService) CheckOut(ctx context.Context, userID string) error {
	// TODO: Implement check-out logic
	// 1. Find active check-in
	// 2. Update occupancy_log (set checked_out_at, calculate duration)
	// 3. Decrement spots.current_occupancy
	// 4. Clear profiles.current_spot_id
	return nil
}

