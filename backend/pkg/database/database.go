package database

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Database wraps database connections
type Database struct {
	DB   *gorm.DB
	Pool *pgxpool.Pool
}

// NewDatabase creates a new database connection
func NewDatabase(ctx context.Context) (*Database, error) {
	supabaseURL := os.Getenv("SUPABASE_DB_URL")
	if supabaseURL == "" {
		return nil, fmt.Errorf("SUPABASE_DB_URL environment variable not set")
	}

	// Create pgx pool for raw queries (better for PostGIS)
	poolConfig, err := pgxpool.ParseConfig(supabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	poolConfig.MaxConns = 20
	poolConfig.MinConns = 5

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Create GORM connection for ORM operations
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: supabaseURL,
	}), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to create GORM connection: %w", err)
	}

	log.Info().Msg("Database connections established successfully")

	return &Database{
		DB:   db,
		Pool: pool,
	}, nil
}

// Close closes database connections
func (d *Database) Close() {
	if d.Pool != nil {
		d.Pool.Close()
		log.Info().Msg("Database pool closed")
	}
}

