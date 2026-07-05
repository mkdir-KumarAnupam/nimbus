package service

import (
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
)

func resvToResponse(reservation *domain.Reservation) *dto.ReservationResponse {
	return &dto.ReservationResponse{
		ID:             reservation.ID,
		ReservationRef: reservation.ReservationRef,
		UserID:         reservation.UserID,
		FlightID:       reservation.FlightID,
		Status:         string(reservation.Status),
		CreatedAt:      reservation.CreatedAt,
		ExpiresAt:      reservation.ExpiresAt,
	}
}
