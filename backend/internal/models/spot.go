package models

import (
	"time"
)

// Spot represents a study spot location
type Spot struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Address     string  `json:"address"`
	
	// Geospatial
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	
	// Capacity
	TotalCapacity    int `json:"total_capacity"`
	CurrentAvailable *int `json:"current_available"`
	
	// Amenities
	HasWifi       bool `json:"has_wifi"`
	HasOutlets    bool `json:"has_outlets"`
	HasPrinter    bool `json:"has_printer"`
	IsQuietZone   bool `json:"is_quiet_zone"`
	IsOutdoor     bool `json:"is_outdoor"`
	
	// Status
	AvailabilityStatus string  `json:"availability_status"` // available, low, full
	ConfidenceScore    float64 `json:"confidence_score"`
	LastUpdateAt       *time.Time `json:"last_update_at,omitempty"`
	
	// Distance (calculated, not stored)
	DistanceMeters *float64 `json:"distance_meters,omitempty"`
	
	// Metadata
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Amenities represents spot amenities (for JSON response)
type Amenities struct {
	Wifi      bool `json:"wifi"`
	Outlets   bool `json:"outlets"`
	Printer   bool `json:"printer"`
	QuietZone bool `json:"quiet_zone"`
	Outdoor   bool `json:"outdoor"`
}

// SpotWithAmenities returns spot data with amenities structured
func (s *Spot) WithAmenities() map[string]interface{} {
	return map[string]interface{}{
		"id":          s.ID,
		"name":        s.Name,
		"description": s.Description,
		"address":     s.Address,
		"latitude":    s.Latitude,
		"longitude":   s.Longitude,
		"total_capacity": s.TotalCapacity,
		"current_available": s.CurrentAvailable,
		"availability_status": s.AvailabilityStatus,
		"confidence_score": s.ConfidenceScore,
		"last_update_at": s.LastUpdateAt,
		"distance_meters": s.DistanceMeters,
		"amenities": Amenities{
			Wifi:      s.HasWifi,
			Outlets:   s.HasOutlets,
			Printer:   s.HasPrinter,
			QuietZone: s.IsQuietZone,
			Outdoor:   s.IsOutdoor,
		},
		"created_at": s.CreatedAt,
		"updated_at": s.UpdatedAt,
	}
}

// UpdateSpotRequest represents a request to update spot availability
type UpdateSpotRequest struct {
	SeatsAvailable int     `json:"seats_available" binding:"required,min=0"`
	NoiseLevel     *string `json:"noise_level,omitempty" binding:"omitempty,oneof=quiet moderate loud"`
	PhotoURL       *string `json:"photo_url,omitempty"`
	UserLatitude   float64 `json:"user_latitude" binding:"required"`
	UserLongitude  float64 `json:"user_longitude" binding:"required"`
}

// SpotUpdate represents a user's spot availability update
type SpotUpdate struct {
	ID        string  `json:"id"`
	SpotID    string  `json:"spot_id"`
	UserID    string  `json:"user_id"`
	
	// Update data
	SeatsAvailable int     `json:"seats_available"`
	NoiseLevel     *string `json:"noise_level,omitempty"`
	PhotoURL       *string `json:"photo_url,omitempty"`
	
	// Location verification
	UserLatitude      float64 `json:"user_latitude"`
	UserLongitude     float64 `json:"user_longitude"`
	DistanceFromSpot  float64 `json:"distance_from_spot"`
	
	// Quality metrics
	ConfidenceScore float64 `json:"confidence_score"`
	IsAccurate      *bool   `json:"is_accurate,omitempty"`
	
	CreatedAt time.Time `json:"created_at"`
}

// RecentUpdate represents a simplified update for spot history
type RecentUpdate struct {
	SeatsAvailable int       `json:"seats_available"`
	NoiseLevel     *string   `json:"noise_level,omitempty"`
	UpdatedAt      time.Time `json:"updated_at"`
	UpdatedBy      string    `json:"updated_by"` // "Anonymous" for privacy
}

// GetSpotsParams represents query parameters for fetching spots
type GetSpotsParams struct {
	Latitude  *float64 `form:"lat"`
	Longitude *float64 `form:"lng"`
	Radius    *int     `form:"radius"`
	Page      *int     `form:"page"`
	Limit     *int     `form:"limit"`
}

// UpdateResponse represents the response after submitting an update
type UpdateResponse struct {
	Update      *SpotUpdate        `json:"update"`
	Rewards     *RewardsData       `json:"rewards"`
	SpotUpdated *SpotStatusUpdate  `json:"spot_updated"`
}

// RewardsData represents points and streak information
type RewardsData struct {
	PointsEarned      int  `json:"points_earned"`
	AccuracyBonus     int  `json:"accuracy_bonus"`
	TotalPointsEarned int  `json:"total_points_earned"`
	UserTotalPoints   int  `json:"user_total_points"`
	StreakUpdated     bool `json:"streak_updated"`
	CurrentStreak     int  `json:"current_streak"`
}

// SpotStatusUpdate represents updated spot status
type SpotStatusUpdate struct {
	CurrentAvailable   int     `json:"current_available"`
	AvailabilityStatus string  `json:"availability_status"`
	ConfidenceScore    float64 `json:"confidence_score"`
}

