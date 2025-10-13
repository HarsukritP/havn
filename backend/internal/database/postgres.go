package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "havn"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "havn_dev"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "havn_dev"
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}

