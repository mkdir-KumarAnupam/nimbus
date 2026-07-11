package service

import (
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
)

func resvToResponse(reservation *domain.Reservation) *dto.ReservationResponse {
	return &dto.ReservationResponse{
		ID:             reservation.ID,
		ReservationRef: reservation.ReservationRef,
		UserID:         reservation.UserID,
		FlightID:       reservation.FlightID,
		FlightSeatID:   reservation.FlightSeatID,
		Status:         string(reservation.Status),
		CreatedAt:      reservation.CreatedAt,
		ExpiresAt:      reservation.ExpiresAt,
	}
}
