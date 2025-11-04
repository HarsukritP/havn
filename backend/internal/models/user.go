package models

import (
	"time"
)

// Profile represents a user profile
type Profile struct {
	ID              string     `json:"id" gorm:"primaryKey;type:uuid"`
	Username        string     `json:"username" gorm:"type:varchar(20);unique;not null"`
	FullName        string     `json:"full_name,omitempty" gorm:"type:varchar(100)"`
	AvatarURL       string     `json:"avatar_url,omitempty"`
	UniversityID    *string    `json:"university_id,omitempty" gorm:"type:uuid"`
	GraduationYear  int        `json:"graduation_year,omitempty"`
	Major           string     `json:"major,omitempty" gorm:"type:varchar(100)"`
	Bio             string     `json:"bio,omitempty"`
	LocationSharing string     `json:"location_sharing" gorm:"type:varchar(20);default:'friends'"`
	CurrentSpotID   *string    `json:"current_spot_id,omitempty" gorm:"type:uuid"`
	CheckedInAt     *time.Time `json:"checked_in_at,omitempty"`
	PushToken       string     `json:"push_token,omitempty"`
	Preferences     JSONB      `json:"preferences" gorm:"type:jsonb"`
	CreatedAt       time.Time  `json:"created_at" gorm:"default:now()"`
	UpdatedAt       time.Time  `json:"updated_at" gorm:"default:now()"`
}

// TableName specifies the table name for GORM
func (Profile) TableName() string {
	return "profiles"
}

// Friendship represents a friendship between users
type Friendship struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID      string     `json:"user_id" gorm:"type:uuid;not null"`
	FriendID    string     `json:"friend_id" gorm:"type:uuid;not null"`
	Status      string     `json:"status" gorm:"type:varchar(20);default:'pending'"`
	RequestedAt time.Time  `json:"requested_at" gorm:"default:now()"`
	RespondedAt *time.Time `json:"responded_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at" gorm:"default:now()"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"default:now()"`
}

// TableName specifies the table name for GORM
func (Friendship) TableName() string {
	return "friendships"
}

