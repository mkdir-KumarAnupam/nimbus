package domain

import "time"

type Ticket struct {
	ID           string `gorm:"type:uuid;primaryKey" json:"id"`
	TicketNumber string `gorm:"uniqueIndex;not null" json:"ticketNumber"`

	UserID        string `gorm:"type:uuid;not null" json:"userId"`
	FlightID      string `gorm:"type:uuid;not null" json:"flightId"`
	ReservationID string `gorm:"type:uuid;not null" json:"reservationId"`

	IssuedAt time.Time `gorm:"not null" json:"issuedAt"`
}
