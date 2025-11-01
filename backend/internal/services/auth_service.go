package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/HarsukritP/havn/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailExists        = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type AuthService struct {
	db    *sql.DB
	redis *redis.Client
}

func NewAuthService(db *sql.DB, redis *redis.Client) *AuthService {
	return &AuthService{
		db:    db,
		redis: redis,
	}
}

// Register creates a new user account
func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.User, string, error) {
	// Check if email already exists
	var exists bool
	err := s.db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		return nil, "", fmt.Errorf("failed to check email existence: %w", err)
	}
	if exists {
		return nil, "", ErrEmailExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &models.User{
		ID:              uuid.New().String(),
		Email:           req.Email,
		PasswordHash:    string(hashedPassword),
		FullName:        req.FullName,
		TotalPoints:     0,
		CurrentStreak:   0,
		ReputationScore: 50.0, // Starting reputation
		EmailVerified:   false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Insert user into database
	query := `
		INSERT INTO users (id, email, password_hash, full_name, total_points, current_streak, reputation_score, email_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err = s.db.ExecContext(ctx, query,
		user.ID, user.Email, user.PasswordHash, user.FullName,
		user.TotalPoints, user.CurrentStreak, user.ReputationScore,
		user.EmailVerified, user.CreatedAt, user.UpdatedAt,
	)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create user: %w", err)
	}

	// Generate JWT token
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.User, string, error) {
	var user models.User
	
	query := `
		SELECT id, email, password_hash, full_name, total_points, current_streak, 
		       reputation_score, email_verified, created_at, updated_at, last_login_at
		FROM users
		WHERE email = $1
	`
	
	err := s.db.QueryRowContext(ctx, query, req.Email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName,
		&user.TotalPoints, &user.CurrentStreak, &user.ReputationScore,
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, "", ErrInvalidCredentials
	}
	if err != nil {
		return nil, "", fmt.Errorf("failed to fetch user: %w", err)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	// Update last login time
	now := time.Now()
	_, err = s.db.ExecContext(ctx, "UPDATE users SET last_login_at = $1 WHERE id = $2", now, user.ID)
	if err != nil {
		// Log but don't fail login
		fmt.Printf("Warning: failed to update last_login_at: %v\n", err)
	}
	user.LastLoginAt = &now

	// Generate JWT token
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return &user, token, nil
}

// Logout invalidates a JWT token by adding it to Redis blacklist
func (s *AuthService) Logout(ctx context.Context, token string) error {
	// Parse token to get expiration time
	claims, err := s.ValidateToken(token)
	if err != nil {
		return err
	}

	// Calculate TTL (time until token expires)
	expiresAt := claims["exp"].(float64)
	ttl := time.Until(time.Unix(int64(expiresAt), 0))

	if ttl > 0 && s.redis != nil {
		// Add token to blacklist in Redis (if Redis is available)
		key := fmt.Sprintf("blacklist:%s", token)
		if err := s.redis.Set(ctx, key, "1", ttl).Err(); err != nil {
			return fmt.Errorf("failed to blacklist token: %w", err)
		}
	}

	// Without Redis, token blacklisting is not supported
	// Token will remain valid until expiration
	return nil
}

// GenerateToken creates a new JWT token for a user
func (s *AuthService) GenerateToken(userID string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production" // Fallback for development
	}

	expiryHours := 168 // 7 days
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * time.Duration(expiryHours)).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

// ValidateToken validates a JWT token and returns its claims
func (s *AuthService) ValidateToken(tokenString string) (jwt.MapClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production"
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// IsTokenBlacklisted checks if a token has been blacklisted
func (s *AuthService) IsTokenBlacklisted(ctx context.Context, token string) (bool, error) {
	// If Redis is not available, no tokens are blacklisted
	if s.redis == nil {
		return false, nil
	}

	key := fmt.Sprintf("blacklist:%s", token)
	exists, err := s.redis.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return exists > 0, nil
}

// GetUserByID retrieves a user by ID
func (s *AuthService) GetUserByID(ctx context.Context, userID string) (*models.User, error) {
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
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}

	return &user, nil
}

