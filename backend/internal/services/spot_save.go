package services

import (
	"context"

	"github.com/harrypall/havn-backend/pkg/database"
)

// SpotSaveService handles spot save requests
type SpotSaveService struct {
	db *database.Database
}

// NewSpotSaveService creates a new spot save service
func NewSpotSaveService(db *database.Database) *SpotSaveService {
	return &SpotSaveService{db: db}
}

// GetRequests retrieves spot save requests for a user
func (s *SpotSaveService) GetRequests(ctx context.Context, userID string) (interface{}, error) {
	// TODO: Implement
	return nil, nil
}

// CreateRequest creates a spot save request
func (s *SpotSaveService) CreateRequest(ctx context.Context, requesterID, saverID, spotID, message string) error {
	// TODO: Implement
	return nil
}

// Respond responds to a spot save request
func (s *SpotSaveService) Respond(ctx context.Context, requestID, response string) error {
	// TODO: Implement
	return nil
}

