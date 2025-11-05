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

// FriendService handles friendship operations
type FriendService struct {
	db *database.Database
}

// NewFriendService creates a new friend service
func NewFriendService(db *database.Database) *FriendService {
	return &FriendService{db: db}
}

// FriendWithLocation represents a friend with their current location
type FriendWithLocation struct {
	ID          string                 `json:"id"`
	Username    string                 `json:"username"`
	FullName    string                 `json:"full_name"`
	AvatarURL   string                 `json:"avatar_url,omitempty"`
	CurrentSpot *CurrentSpot           `json:"current_spot,omitempty"`
	CheckedInAt *time.Time             `json:"checked_in_at,omitempty"`
	DistanceFromMe float64             `json:"distance_from_me,omitempty"`
}

// CurrentSpot represents a friend's current spot
type CurrentSpot struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// FriendRequest represents a friend request
type FriendRequest struct {
	FriendshipID string    `json:"friendship_id"`
	User         UserInfo  `json:"user"`
	RequestedAt  time.Time `json:"requested_at"`
}

// UserInfo represents basic user information
type UserInfo struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FullName  string `json:"full_name"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

// FriendsResponse represents the complete friends data
type FriendsResponse struct {
	Friends                 []FriendWithLocation `json:"friends"`
	FriendRequestsReceived  []FriendRequest      `json:"friend_requests_received"`
	FriendRequestsSent      []FriendRequest      `json:"friend_requests_sent"`
}

// GetFriends retrieves a user's friends and friend requests
func (s *FriendService) GetFriends(ctx context.Context, userID string) (*FriendsResponse, error) {
	response := &FriendsResponse{
		Friends:                []FriendWithLocation{},
		FriendRequestsReceived: []FriendRequest{},
		FriendRequestsSent:     []FriendRequest{},
	}

	// Get accepted friends with their current location
	friendsQuery := `
		SELECT 
			p.id, p.username, p.full_name, p.avatar_url,
			p.current_spot_id, p.checked_in_at,
			s.id, s.name, 
			ST_Y(s.location::geometry) as latitude,
			ST_X(s.location::geometry) as longitude
		FROM friendships f
		JOIN profiles p ON (
			CASE 
				WHEN f.user_id = $1 THEN p.id = f.friend_id
				ELSE p.id = f.user_id
			END
		)
		LEFT JOIN spots s ON s.id = p.current_spot_id
		WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
		ORDER BY p.checked_in_at DESC NULLS LAST
	`

	rows, err := s.db.Pool.Query(ctx, friendsQuery, userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query friends")
		return nil, fmt.Errorf("failed to get friends: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var friend FriendWithLocation
		var currentSpotID *string
		var checkedInAt *time.Time
		var spotID, spotName *string
		var spotLat, spotLon *float64

		err := rows.Scan(
			&friend.ID,
			&friend.Username,
			&friend.FullName,
			&friend.AvatarURL,
			&currentSpotID,
			&checkedInAt,
			&spotID,
			&spotName,
			&spotLat,
			&spotLon,
		)

		if err != nil {
			log.Error().Err(err).Msg("Failed to scan friend")
			continue
		}

		friend.CheckedInAt = checkedInAt

		// Add current spot if available
		if spotID != nil && spotName != nil {
			friend.CurrentSpot = &CurrentSpot{
				ID:        *spotID,
				Name:      *spotName,
				Latitude:  *spotLat,
				Longitude: *spotLon,
			}
		}

		response.Friends = append(response.Friends, friend)
	}

	// Get received friend requests
	receivedQuery := `
		SELECT 
			f.id, p.id, p.username, p.full_name, p.avatar_url, f.requested_at
		FROM friendships f
		JOIN profiles p ON p.id = f.user_id
		WHERE f.friend_id = $1 AND f.status = 'pending'
		ORDER BY f.requested_at DESC
	`

	rows, err = s.db.Pool.Query(ctx, receivedQuery, userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query received friend requests")
		return nil, fmt.Errorf("failed to get friend requests: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var req FriendRequest
		err := rows.Scan(
			&req.FriendshipID,
			&req.User.ID,
			&req.User.Username,
			&req.User.FullName,
			&req.User.AvatarURL,
			&req.RequestedAt,
		)

		if err != nil {
			log.Error().Err(err).Msg("Failed to scan friend request")
			continue
		}

		response.FriendRequestsReceived = append(response.FriendRequestsReceived, req)
	}

	// Get sent friend requests
	sentQuery := `
		SELECT 
			f.id, p.id, p.username, p.full_name, p.avatar_url, f.requested_at
		FROM friendships f
		JOIN profiles p ON p.id = f.friend_id
		WHERE f.user_id = $1 AND f.status = 'pending'
		ORDER BY f.requested_at DESC
	`

	rows, err = s.db.Pool.Query(ctx, sentQuery, userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query sent friend requests")
		return nil, fmt.Errorf("failed to get sent requests: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var req FriendRequest
		err := rows.Scan(
			&req.FriendshipID,
			&req.User.ID,
			&req.User.Username,
			&req.User.FullName,
			&req.User.AvatarURL,
			&req.RequestedAt,
		)

		if err != nil {
			log.Error().Err(err).Msg("Failed to scan sent request")
			continue
		}

		response.FriendRequestsSent = append(response.FriendRequestsSent, req)
	}

	return response, nil
}

// SendRequest sends a friend request
func (s *FriendService) SendRequest(ctx context.Context, userID, friendID string) (*models.Friendship, error) {
	// Check if users are the same
	if userID == friendID {
		return nil, fmt.Errorf("cannot send friend request to yourself")
	}

	// Check if friendship already exists
	var existingID string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id FROM friendships
		WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
		LIMIT 1
	`, userID, friendID).Scan(&existingID)

	if err == nil {
		return nil, fmt.Errorf("friendship already exists")
	} else if err != pgx.ErrNoRows {
		return nil, fmt.Errorf("failed to check existing friendship: %w", err)
	}

	// Create friend request
	var friendship models.Friendship
	err = s.db.Pool.QueryRow(ctx, `
		INSERT INTO friendships (user_id, friend_id, status)
		VALUES ($1, $2, 'pending')
		RETURNING id, user_id, friend_id, status, requested_at, created_at, updated_at
	`, userID, friendID).Scan(
		&friendship.ID,
		&friendship.UserID,
		&friendship.FriendID,
		&friendship.Status,
		&friendship.RequestedAt,
		&friendship.CreatedAt,
		&friendship.UpdatedAt,
	)

	if err != nil {
		log.Error().Err(err).Msg("Failed to create friend request")
		return nil, fmt.Errorf("failed to send friend request: %w", err)
	}

	log.Info().
		Str("user_id", userID).
		Str("friend_id", friendID).
		Msg("Friend request sent")

	return &friendship, nil
}

// RespondToRequest responds to a friend request
func (s *FriendService) RespondToRequest(ctx context.Context, friendshipID, userID, response string) error {
	// Validate response
	if response != "accepted" && response != "declined" {
		return fmt.Errorf("response must be 'accepted' or 'declined'")
	}

	// Verify the user is the friend_id (recipient) of the request
	var friendID string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT friend_id FROM friendships
		WHERE id = $1 AND status = 'pending'
	`, friendshipID).Scan(&friendID)

	if err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("friend request not found or already responded")
		}
		return fmt.Errorf("failed to find friend request: %w", err)
	}

	if friendID != userID {
		return fmt.Errorf("unauthorized: you are not the recipient of this request")
	}

	// Update friendship status
	_, err = s.db.Pool.Exec(ctx, `
		UPDATE friendships
		SET status = $1, responded_at = NOW(), updated_at = NOW()
		WHERE id = $2
	`, response, friendshipID)

	if err != nil {
		log.Error().Err(err).Msg("Failed to update friendship")
		return fmt.Errorf("failed to respond to friend request: %w", err)
	}

	log.Info().
		Str("friendship_id", friendshipID).
		Str("response", response).
		Msg("Friend request responded")

	return nil
}

