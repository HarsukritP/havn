package models

import (
	"time"
)

// User represents a registered user
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	PasswordHash string `json:"-"` // Never send password hash in JSON
	FullName  string    `json:"full_name"`
	
	// Gamification
	TotalPoints      int     `json:"total_points"`
	CurrentStreak    int     `json:"current_streak"`
	LastCheckInDate  *time.Time `json:"last_check_in_date,omitempty"`
	ReputationScore  float64 `json:"reputation_score"`
	
	// Metadata
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	LastLoginAt   *time.Time `json:"last_login_at,omitempty"`
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"full_name" binding:"required,min=2"`
}

// LoginRequest represents a user login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UpdateUserRequest represents a user profile update request
type UpdateUserRequest struct {
	FullName *string `json:"full_name,omitempty"`
	Email    *string `json:"email,omitempty" binding:"omitempty,email"`
}

// UserStats represents user statistics
type UserStats struct {
	TotalCheckIns      int     `json:"total_check_ins"`
	CheckInsThisWeek   int     `json:"check_ins_this_week"`
	CheckInsToday      int     `json:"check_ins_today"`
	AccuracyRate       float64 `json:"accuracy_rate"`
	RankPercentile     int     `json:"rank_percentile"`
	AchievementsUnlocked int   `json:"achievements_unlocked"`
}

// LeaderboardEntry represents a user's position on the leaderboard
type LeaderboardEntry struct {
	Rank            int     `json:"rank"`
	UserID          string  `json:"user_id"`
	FullName        string  `json:"full_name"` // Partially obscured
	Points          int     `json:"points"`
	CheckIns        int     `json:"check_ins"`
	ReputationScore float64 `json:"reputation_score"`
	IsCurrentUser   bool    `json:"is_current_user,omitempty"`
}

