package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// Spot represents a study location
type Spot struct {
	ID               string          `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Name             string          `json:"name" gorm:"type:varchar(200);not null"`
	BuildingName     string          `json:"building_name" gorm:"type:varchar(200)"`
	FloorNumber      string          `json:"floor_number" gorm:"type:varchar(10)"`
	Location         string          `json:"-" gorm:"type:geometry(Point,4326);not null"` // PostGIS geometry
	Latitude         float64         `json:"latitude" gorm:"-"`                            // Computed
	Longitude        float64         `json:"longitude" gorm:"-"`                           // Computed
	DistanceMeters   float64         `json:"distance_meters,omitempty" gorm:"-"`           // Computed
	Address          string          `json:"address,omitempty"`
	SpotType         string          `json:"spot_type" gorm:"type:varchar(50);not null"`
	Capacity         int             `json:"capacity" gorm:"default:50"`
	CurrentOccupancy int             `json:"current_occupancy" gorm:"default:0"`
	OccupancyPercent int             `json:"occupancy_percentage" gorm:"-"` // Computed
	OccupancyStatus  string          `json:"occupancy_status" gorm:"-"`     // Computed: low|moderate|high
	Amenities        JSONB           `json:"amenities" gorm:"type:jsonb"`
	Hours            JSONB           `json:"hours" gorm:"type:jsonb"`
	PhotoURLs        []string        `json:"photo_urls,omitempty" gorm:"type:text[]"`
	IsVerified       bool            `json:"is_verified" gorm:"default:false"`
	VerifiedBy       *string         `json:"verified_by,omitempty" gorm:"type:uuid"`
	VerifiedAt       *time.Time      `json:"verified_at,omitempty"`
	AvgRating        float64         `json:"avg_rating" gorm:"type:decimal(2,1);default:0.0"`
	TotalReviews     int             `json:"total_reviews" gorm:"default:0"`
	CreatedBy        *string         `json:"created_by,omitempty" gorm:"type:uuid"`
	CreatedAt        time.Time       `json:"created_at" gorm:"default:now()"`
	UpdatedAt        time.Time       `json:"updated_at" gorm:"default:now()"`
	IsOpenNow        bool            `json:"is_open_now" gorm:"-"` // Computed
	FriendsHere      []FriendAtSpot  `json:"friends_here,omitempty" gorm:"-"`
}

// FriendAtSpot represents a friend currently at a spot
type FriendAtSpot struct {
	UserID       string    `json:"user_id"`
	Username     string    `json:"username"`
	FullName     string    `json:"full_name"`
	AvatarURL    string    `json:"avatar_url,omitempty"`
	CheckedInAt  time.Time `json:"checked_in_at"`
}

// JSONB is a custom type for PostgreSQL JSONB fields
type JSONB map[string]interface{}

// Value implements driver.Valuer interface
func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan implements sql.Scanner interface
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = make(map[string]interface{})
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return json.Unmarshal([]byte(value.(string)), j)
	}

	return json.Unmarshal(bytes, j)
}

// TableName specifies the table name for GORM
func (Spot) TableName() string {
	return "spots"
}

// CalculateOccupancyStatus determines the occupancy status
func (s *Spot) CalculateOccupancyStatus() {
	if s.Capacity == 0 {
		s.OccupancyPercent = 0
		s.OccupancyStatus = "low"
		return
	}

	s.OccupancyPercent = (s.CurrentOccupancy * 100) / s.Capacity

	if s.OccupancyPercent <= 33 {
		s.OccupancyStatus = "low"
	} else if s.OccupancyPercent <= 66 {
		s.OccupancyStatus = "moderate"
	} else {
		s.OccupancyStatus = "high"
	}
}

