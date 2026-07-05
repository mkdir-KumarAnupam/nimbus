package domain

import "time"

type ReservationStatus string

const (
	ReservationPending   ReservationStatus = "pending"
	ReservationConfirmed ReservationStatus = "confirmed"
	ReservationCancelled ReservationStatus = "cancelled"
	ReservationExpired   ReservationStatus = "expired"
)

type Reservation struct {
	ID             string `gorm:"type:uuid;primaryKey" json:"id"`
	ReservationRef string `gorm:"uniqueIndex;not null" json:"reservationRef"`

	UserID       string `gorm:"type:uuid;not null;index" json:"userId"`
	FlightID     string `gorm:"type:uuid;not null;index" json:"flightId"`
	FlightSeatID string `gorm:"type:uuid;not null;index" json:"flightSeatId"`

	Status ReservationStatus `gorm:"type:text;not null" json:"status"`

	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}
