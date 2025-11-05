package services

import (
	"context"
	"fmt"

	"github.com/harrypall/havn-backend/internal/models"
	"github.com/harrypall/havn-backend/pkg/database"
	"github.com/rs/zerolog/log"
)

// UserService handles user-related operations
type UserService struct {
	db *database.Database
}

// NewUserService creates a new user service
func NewUserService(db *database.Database) *UserService {
	return &UserService{db: db}
}

// GetProfile retrieves a user's profile
func (s *UserService) GetProfile(ctx context.Context, userID string) (*models.Profile, error) {
	var profile models.Profile
	
	query := `
		SELECT 
			id, username, full_name, avatar_url, university_id,
			graduation_year, major, bio, location_sharing,
			current_spot_id, checked_in_at, push_token, preferences,
			created_at, updated_at
		FROM profiles
		WHERE id = $1
	`
	
	var preferences []byte
	err := s.db.Pool.QueryRow(ctx, query, userID).Scan(
		&profile.ID,
		&profile.Username,
		&profile.FullName,
		&profile.AvatarURL,
		&profile.UniversityID,
		&profile.GraduationYear,
		&profile.Major,
		&profile.Bio,
		&profile.LocationSharing,
		&profile.CurrentSpotID,
		&profile.CheckedInAt,
		&profile.PushToken,
		&preferences,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)
	
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Failed to get profile")
		return nil, fmt.Errorf("profile not found: %w", err)
	}
	
	// Parse preferences
	if err := profile.Preferences.Scan(preferences); err != nil {
		log.Error().Err(err).Msg("Failed to parse preferences")
	}
	
	return &profile, nil
}

// UpdateProfile updates a user's profile
func (s *UserService) UpdateProfile(ctx context.Context, userID string, updates map[string]interface{}) error {
	// Build dynamic update query
	query := "UPDATE profiles SET "
	args := []interface{}{}
	argIndex := 1
	
	for key, value := range updates {
		if argIndex > 1 {
			query += ", "
		}
		query += fmt.Sprintf("%s = $%d", key, argIndex)
		args = append(args, value)
		argIndex++
	}
	
	query += fmt.Sprintf(", updated_at = NOW() WHERE id = $%d", argIndex)
	args = append(args, userID)
	
	_, err := s.db.Pool.Exec(ctx, query, args...)
	if err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("Failed to update profile")
		return fmt.Errorf("failed to update profile: %w", err)
	}
	
	log.Info().Str("user_id", userID).Msg("Profile updated successfully")
	return nil
}

// Search searches for users by username or email
func (s *UserService) Search(ctx context.Context, query string, currentUserID string) ([]models.Profile, error) {
	searchQuery := `
		SELECT 
			p.id, p.username, p.full_name, p.avatar_url,
			p.graduation_year,
			CASE 
				WHEN f.status = 'accepted' THEN true
				ELSE false
			END as is_friend,
			f.status as friend_request_status
		FROM profiles p
		LEFT JOIN friendships f ON (
			(f.user_id = $1 AND f.friend_id = p.id) OR
			(f.friend_id = $1 AND f.user_id = p.id)
		)
		WHERE p.id != $1 
		AND (
			p.username ILIKE '%' || $2 || '%' OR
			p.full_name ILIKE '%' || $2 || '%'
		)
		LIMIT 20
	`
	
	rows, err := s.db.Pool.Query(ctx, searchQuery, currentUserID, query)
	if err != nil {
		log.Error().Err(err).Str("query", query).Msg("Failed to search users")
		return nil, fmt.Errorf("failed to search users: %w", err)
	}
	defer rows.Close()
	
	var profiles []models.Profile
	for rows.Next() {
		var profile models.Profile
		var isFriend bool
		var friendRequestStatus *string
		
		err := rows.Scan(
			&profile.ID,
			&profile.Username,
			&profile.FullName,
			&profile.AvatarURL,
			&profile.GraduationYear,
			&isFriend,
			&friendRequestStatus,
		)
		
		if err != nil {
			log.Error().Err(err).Msg("Failed to scan user")
			continue
		}
		
		profiles = append(profiles, profile)
	}
	
	return profiles, nil
}

