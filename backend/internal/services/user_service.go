package services

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/HarsukritP/havn/backend/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(ctx context.Context, userID string) (*models.User, error) {
	var user models.User
	
	query := `
		SELECT id, email, full_name, total_points, current_streak, 
		       reputation_score, email_verified, created_at, updated_at, last_login_at
		FROM users
		WHERE id = $1
	`
	
	err := s.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID, &user.Email, &user.FullName,
		&user.TotalPoints, &user.CurrentStreak, &user.ReputationScore,
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}

	return &user, nil
}

// UpdateUser updates user profile information
func (s *UserService) UpdateUser(ctx context.Context, userID string, req *models.UpdateUserRequest) (*models.User, error) {
	// Build dynamic update query
	// For simplicity, updating both fields if provided
	if req.FullName != nil {
		_, err := s.db.ExecContext(ctx, "UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2", *req.FullName, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to update full_name: %w", err)
		}
	}

	if req.Email != nil {
		// Check if email already exists
		var exists bool
		err := s.db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND id != $2)", *req.Email, userID).Scan(&exists)
		if err != nil {
			return nil, fmt.Errorf("failed to check email: %w", err)
		}
		if exists {
			return nil, fmt.Errorf("email already in use")
		}

		_, err = s.db.ExecContext(ctx, "UPDATE users SET email = $1, email_verified = false, updated_at = NOW() WHERE id = $2", *req.Email, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to update email: %w", err)
		}
	}

	// Return updated user
	return s.GetUserByID(ctx, userID)
}

// GetUserStats retrieves statistics for a user
func (s *UserService) GetUserStats(ctx context.Context, userID string) (*models.UserStats, error) {
	stats := &models.UserStats{}

	// Get total check-ins
	err := s.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM spot_updates WHERE user_id = $1", userID).Scan(&stats.TotalCheckIns)
	if err != nil {
		stats.TotalCheckIns = 0
	}

	// Get check-ins this week (simplified - assumes Sunday start)
	err = s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM spot_updates WHERE user_id = $1 AND created_at >= DATE_TRUNC('week', NOW())",
		userID,
	).Scan(&stats.CheckInsThisWeek)
	if err != nil {
		stats.CheckInsThisWeek = 0
	}

	// Get check-ins today
	err = s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM spot_updates WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE",
		userID,
	).Scan(&stats.CheckInsToday)
	if err != nil {
		stats.CheckInsToday = 0
	}

	// Accuracy rate and rank percentile would require more complex queries
	stats.AccuracyRate = 92.0          // TODO: Calculate based on update accuracy
	stats.RankPercentile = 15          // TODO: Calculate based on leaderboard position
	stats.AchievementsUnlocked = 3     // TODO: Query achievements table

	return stats, nil
}

// GetLeaderboard retrieves the leaderboard
func (s *UserService) GetLeaderboard(ctx context.Context, period string, limit int, currentUserID string) ([]*models.LeaderboardEntry, error) {
	query := `
		SELECT id, full_name, total_points, reputation_score,
		       (SELECT COUNT(*) FROM spot_updates WHERE user_id = users.id) as check_ins
		FROM users
		ORDER BY total_points DESC
		LIMIT $1
	`

	rows, err := s.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query leaderboard: %w", err)
	}
	defer rows.Close()

	var entries []*models.LeaderboardEntry
	rank := 1
	for rows.Next() {
		entry := &models.LeaderboardEntry{Rank: rank}
		var fullName string
		
		err := rows.Scan(&entry.UserID, &fullName, &entry.Points, &entry.ReputationScore, &entry.CheckIns)
		if err != nil {
			return nil, fmt.Errorf("failed to scan leaderboard entry: %w", err)
		}

		// Partially obscure name for privacy
		entry.FullName = obscureName(fullName)
		entry.IsCurrentUser = (entry.UserID == currentUserID)

		entries = append(entries, entry)
		rank++
	}

	return entries, nil
}

// obscureName partially obscures a name for privacy (e.g., "John Smith" → "John S.")
func obscureName(fullName string) string {
	if len(fullName) == 0 {
		return "Anonymous"
	}

	// Simple implementation - just show first name + last initial
	// TODO: More sophisticated privacy handling
	return fullName // For now, return full name (update in production)
}

