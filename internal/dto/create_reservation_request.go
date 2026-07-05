package dto

import "time"

type CreateReservationRequest struct {
	UserID   string `json:"user_id"`
	FlightID string `json:"flight_id"`
}

type ReserveSeatRequest struct {
	UserID       string `json:"userId"`
	FlightSeatID string `json:"flightSeatId"`
}

type ReservationResponse struct {
	ID             string `json:"id"`
	ReservationRef string `json:"reservation_ref"`

	UserID   string `json:"user_id"`
	FlightID string `json:"flight_id"`

	Status string `json:"status"`

	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}
