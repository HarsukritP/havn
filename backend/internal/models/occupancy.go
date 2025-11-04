package models

import (
	"time"
)

// OccupancyLog represents a check-in/check-out record
type OccupancyLog struct {
	ID               string     `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID           string     `json:"user_id" gorm:"type:uuid;not null"`
	SpotID           string     `json:"spot_id" gorm:"type:uuid;not null"`
	Status           string     `json:"status" gorm:"type:varchar(20);not null"`
	CheckedInAt      time.Time  `json:"checked_in_at" gorm:"not null;default:now()"`
	CheckedOutAt     *time.Time `json:"checked_out_at,omitempty"`
	LocationAccuracy float64    `json:"location_accuracy,omitempty" gorm:"type:decimal(10,2)"`
	SessionDuration  *string    `json:"session_duration,omitempty" gorm:"type:interval"`
	CreatedAt        time.Time  `json:"created_at" gorm:"default:now()"`
}

// TableName specifies the table name for GORM
func (OccupancyLog) TableName() string {
	return "occupancy_logs"
}

// SpotSaveRequest represents a request to save a spot
type SpotSaveRequest struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	RequesterID string     `json:"requester_id" gorm:"type:uuid;not null"`
	SaverID     string     `json:"saver_id" gorm:"type:uuid;not null"`
	SpotID      string     `json:"spot_id" gorm:"type:uuid;not null"`
	Status      string     `json:"status" gorm:"type:varchar(20);default:'pending'"`
	Message     string     `json:"message,omitempty"`
	RequestedAt time.Time  `json:"requested_at" gorm:"default:now()"`
	ExpiresAt   time.Time  `json:"expires_at"`
	RespondedAt *time.Time `json:"responded_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at" gorm:"default:now()"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"default:now()"`
}

// TableName specifies the table name for GORM
func (SpotSaveRequest) TableName() string {
	return "spot_save_requests"
}

