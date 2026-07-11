package domain

import "time"

type BookingStatus string

const (
	BookingPending   BookingStatus = "pending"
	BookingConfirmed BookingStatus = "confirmed"
	BookingCancelled BookingStatus = "cancelled"
)

type Booking struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	PNR string `gorm:"type:varchar(6);uniqueIndex;not null" json:"pnr"`

	UserID string `gorm:"type:uuid;not null;index" json:"user_id"`

	Status BookingStatus `gorm:"type:varchar(20);not null" json:"status"`

	CreatedAt time.Time `gorm:"not null;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null;autoUpdateTime" json:"updated_at"`
}
