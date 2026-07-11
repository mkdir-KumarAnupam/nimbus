package domain

import "time"

type TicketStatus string

const (
	TicketIssued    TicketStatus = "issued"
	TicketCancelled TicketStatus = "cancelled"
	TicketUsed      TicketStatus = "used"
)

type Ticket struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	TicketNumber string `gorm:"type:varchar(50);uniqueIndex;not null" json:"ticketNumber"`

	UserID string `gorm:"type:uuid;not null;index" json:"userId"`

	FlightID string `gorm:"type:uuid;not null;index" json:"flightId"`

	ReservationID string `gorm:"type:uuid;not null;uniqueIndex" json:"reservationId"`

	Status TicketStatus `gorm:"type:varchar(20);not null;default:'issued'" json:"status"`

	IssuedAt time.Time `gorm:"not null" json:"issuedAt"`

	CreatedAt time.Time `gorm:"not null" json:"createdAt"`

	UpdatedAt time.Time `gorm:"not null" json:"updatedAt"`
}
