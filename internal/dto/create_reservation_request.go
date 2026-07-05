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
	ID             string    `json:"id"`
	ReservationRef string    `json:"reservationRef"`
	UserID         string    `json:"userId"`
	FlightID       string    `json:"flightId"`
	FlightSeatID   string    `json:"flightSeatId"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"createdAt"`
	ExpiresAt      time.Time `json:"expiresAt"`
}
