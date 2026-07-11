package dto

import "time"

type TicketResponse struct {
	ID            string    `json:"id"`
	TicketNumber  string    `json:"ticketNumber"`
	UserID        string    `json:"userId"`
	FlightID      string    `json:"flightId"`
	ReservationID string    `json:"reservationId"`
	Status        string    `json:"status"`
	IssuedAt      time.Time `json:"issuedAt"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
