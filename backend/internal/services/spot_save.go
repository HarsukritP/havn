package services

import (
	"context"
	"fmt"
	"time"

	"github.com/harrypall/havn-backend/internal/models"
	"github.com/harrypall/havn-backend/pkg/database"
	"github.com/jackc/pgx/v5"
	"github.com/rs/zerolog/log"
)

// SpotSaveService handles spot save requests
type SpotSaveService struct {
	db *database.Database
}

// NewSpotSaveService creates a new spot save service
func NewSpotSaveService(db *database.Database) *SpotSaveService {
	return &SpotSaveService{db: db}
}

// SpotSaveRequestWithDetails represents a spot save request with full details
type SpotSaveRequestWithDetails struct {
	ID          string      `json:"id"`
	Requester   UserDetails `json:"requester"`
	Saver       UserDetails `json:"saver"`
	Spot        SpotDetails `json:"spot"`
	Status      string      `json:"status"`
	Message     string      `json:"message,omitempty"`
	RequestedAt time.Time   `json:"requested_at"`
	ExpiresAt   time.Time   `json:"expires_at"`
	RespondedAt *time.Time  `json:"responded_at,omitempty"`
}

// UserDetails represents user information in requests
type UserDetails struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FullName  string `json:"full_name"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

// SpotDetails represents spot information in requests
type SpotDetails struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// SpotSaveRequestsResponse represents all spot save requests
type SpotSaveRequestsResponse struct {
	Received []SpotSaveRequestWithDetails `json:"received"`
	Sent     []SpotSaveRequestWithDetails `json:"sent"`
}

// GetRequests retrieves spot save requests for a user
func (s *SpotSaveService) GetRequests(ctx context.Context, userID string) (*SpotSaveRequestsResponse, error) {
	response := &SpotSaveRequestsResponse{
		Received: []SpotSaveRequestWithDetails{},
		Sent:     []SpotSaveRequestWithDetails{},
	}

	// Get received requests (where user is the saver)
	receivedQuery := `
		SELECT 
			ssr.id, ssr.status, ssr.message, ssr.requested_at, ssr.expires_at, ssr.responded_at,
			requester.id, requester.username, requester.full_name, requester.avatar_url,
			saver.id, saver.username, saver.full_name, saver.avatar_url,
			s.id, s.name
		FROM spot_save_requests ssr
		JOIN profiles requester ON requester.id = ssr.requester_id
		JOIN profiles saver ON saver.id = ssr.saver_id
		JOIN spots s ON s.id = ssr.spot_id
		WHERE ssr.saver_id = $1 AND ssr.status != 'expired'
		ORDER BY ssr.requested_at DESC
		LIMIT 50
	`

	rows, err := s.db.Pool.Query(ctx, receivedQuery, userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query received spot save requests")
		return nil, fmt.Errorf("failed to get received requests: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var req SpotSaveRequestWithDetails
		err := rows.Scan(
			&req.ID,
			&req.Status,
			&req.Message,
			&req.RequestedAt,
			&req.ExpiresAt,
			&req.RespondedAt,
			&req.Requester.ID,
			&req.Requester.Username,
			&req.Requester.FullName,
			&req.Requester.AvatarURL,
			&req.Saver.ID,
			&req.Saver.Username,
			&req.Saver.FullName,
			&req.Saver.AvatarURL,
			&req.Spot.ID,
			&req.Spot.Name,
		)

		if err != nil {
			log.Error().Err(err).Msg("Failed to scan spot save request")
			continue
		}

		response.Received = append(response.Received, req)
	}

	// Get sent requests (where user is the requester)
	sentQuery := `
		SELECT 
			ssr.id, ssr.status, ssr.message, ssr.requested_at, ssr.expires_at, ssr.responded_at,
			requester.id, requester.username, requester.full_name, requester.avatar_url,
			saver.id, saver.username, saver.full_name, saver.avatar_url,
			s.id, s.name
		FROM spot_save_requests ssr
		JOIN profiles requester ON requester.id = ssr.requester_id
		JOIN profiles saver ON saver.id = ssr.saver_id
		JOIN spots s ON s.id = ssr.spot_id
		WHERE ssr.requester_id = $1 AND ssr.status != 'expired'
		ORDER BY ssr.requested_at DESC
		LIMIT 50
	`

	rows, err = s.db.Pool.Query(ctx, sentQuery, userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query sent spot save requests")
		return nil, fmt.Errorf("failed to get sent requests: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var req SpotSaveRequestWithDetails
		err := rows.Scan(
			&req.ID,
			&req.Status,
			&req.Message,
			&req.RequestedAt,
			&req.ExpiresAt,
			&req.RespondedAt,
			&req.Requester.ID,
			&req.Requester.Username,
			&req.Requester.FullName,
			&req.Requester.AvatarURL,
			&req.Saver.ID,
			&req.Saver.Username,
			&req.Saver.FullName,
			&req.Saver.AvatarURL,
			&req.Spot.ID,
			&req.Spot.Name,
		)

		if err != nil {
			log.Error().Err(err).Msg("Failed to scan spot save request")
			continue
		}

		response.Sent = append(response.Sent, req)
	}

	return response, nil
}

// CreateRequest creates a spot save request
func (s *SpotSaveService) CreateRequest(ctx context.Context, requesterID, saverID, spotID, message string) (*models.SpotSaveRequest, error) {
	// 1. Validate requester and saver are friends
	var friendshipID string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id FROM friendships
		WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
		AND status = 'accepted'
		LIMIT 1
	`, requesterID, saverID).Scan(&friendshipID)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("saver is not your friend")
		}
		return nil, fmt.Errorf("failed to check friendship: %w", err)
	}

	// 2. Validate saver is within 2km of the spot
	var saverCurrentSpotID *string
	err = s.db.Pool.QueryRow(ctx, `
		SELECT current_spot_id FROM profiles WHERE id = $1
	`, saverID).Scan(&saverCurrentSpotID)

	if err != nil {
		return nil, fmt.Errorf("failed to get saver profile: %w", err)
	}

	// Get spot location
	var spotLat, spotLon float64
	err = s.db.Pool.QueryRow(ctx, `
		SELECT 
			ST_Y(location::geometry) as latitude,
			ST_X(location::geometry) as longitude
		FROM spots WHERE id = $1
	`, spotID).Scan(&spotLat, &spotLon)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("spot not found")
		}
		return nil, fmt.Errorf("failed to get spot location: %w", err)
	}

	// Check if saver is checked in and within 2km
	if saverCurrentSpotID != nil {
		// Get saver's current location
		var saverLat, saverLon float64
		err = s.db.Pool.QueryRow(ctx, `
			SELECT 
				ST_Y(location::geometry) as latitude,
				ST_X(location::geometry) as longitude
			FROM spots WHERE id = $1
		`, *saverCurrentSpotID).Scan(&saverLat, &saverLon)

		if err == nil {
			// Calculate distance (simplified check using PostGIS)
			var distance float64
			err = s.db.Pool.QueryRow(ctx, `
				SELECT ST_Distance(
					ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
					ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
				)
			`, spotLon, spotLat, saverLon, saverLat).Scan(&distance)

			if err != nil {
				return nil, fmt.Errorf("failed to calculate distance: %w", err)
			}

			if distance > 2000 {
				return nil, fmt.Errorf("saver is too far from the spot (%.0fm away, must be within 2000m)", distance)
			}
		}
	} else {
		// Saver is not currently checked in anywhere - still allow request
		log.Info().Str("saver_id", saverID).Msg("Saver not currently checked in, allowing request anyway")
	}

	// 3. Create the spot save request
	var request models.SpotSaveRequest
	err = s.db.Pool.QueryRow(ctx, `
		INSERT INTO spot_save_requests (requester_id, saver_id, spot_id, message, status, expires_at)
		VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '30 minutes')
		RETURNING id, requester_id, saver_id, spot_id, status, message, requested_at, expires_at, created_at, updated_at
	`, requesterID, saverID, spotID, message).Scan(
		&request.ID,
		&request.RequesterID,
		&request.SaverID,
		&request.SpotID,
		&request.Status,
		&request.Message,
		&request.RequestedAt,
		&request.ExpiresAt,
		&request.CreatedAt,
		&request.UpdatedAt,
	)

	if err != nil {
		log.Error().Err(err).Msg("Failed to create spot save request")
		return nil, fmt.Errorf("failed to create spot save request: %w", err)
	}

	log.Info().
		Str("requester_id", requesterID).
		Str("saver_id", saverID).
		Str("spot_id", spotID).
		Msg("Spot save request created")

	// TODO: Send push notification to saver

	return &request, nil
}

// Respond responds to a spot save request
func (s *SpotSaveService) Respond(ctx context.Context, requestID, userID, response string) error {
	// Validate response
	if response != "accepted" && response != "declined" {
		return fmt.Errorf("response must be 'accepted' or 'declined'")
	}

	// Verify the user is the saver
	var saverID string
	var status string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT saver_id, status FROM spot_save_requests
		WHERE id = $1
	`, requestID).Scan(&saverID, &status)

	if err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("spot save request not found")
		}
		return fmt.Errorf("failed to find spot save request: %w", err)
	}

	if saverID != userID {
		return fmt.Errorf("unauthorized: you are not the saver of this request")
	}

	if status != "pending" {
		return fmt.Errorf("request already responded or expired")
	}

	// Check if request has expired
	var expiresAt time.Time
	err = s.db.Pool.QueryRow(ctx, `
		SELECT expires_at FROM spot_save_requests WHERE id = $1
	`, requestID).Scan(&expiresAt)

	if err != nil {
		return fmt.Errorf("failed to check expiration: %w", err)
	}

	if time.Now().After(expiresAt) {
		// Mark as expired
		_, _ = s.db.Pool.Exec(ctx, `
			UPDATE spot_save_requests SET status = 'expired' WHERE id = $1
		`, requestID)
		return fmt.Errorf("request has expired")
	}

	// Update request status
	_, err = s.db.Pool.Exec(ctx, `
		UPDATE spot_save_requests
		SET status = $1, responded_at = NOW(), updated_at = NOW()
		WHERE id = $2
	`, response, requestID)

	if err != nil {
		log.Error().Err(err).Msg("Failed to update spot save request")
		return fmt.Errorf("failed to respond to spot save request: %w", err)
	}

	log.Info().
		Str("request_id", requestID).
		Str("response", response).
		Msg("Spot save request responded")

	// TODO: Send push notification to requester

	return nil
}

