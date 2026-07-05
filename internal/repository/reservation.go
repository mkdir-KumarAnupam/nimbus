package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type ReservationRepository interface {
	CreateReservation(ctx context.Context, reservation *domain.Reservation) error
	GetReservationByID(ctx context.Context, id string) (*domain.Reservation, error)
	ReservationRefExists(ctx context.Context, reservationRef string) (bool, error)
	GetReservationsByUserID(ctx context.Context, userID string) ([]*domain.Reservation, error)
	GetReservationsByFlightID(ctx context.Context, flightID string) ([]*domain.Reservation, error)
	ListReservations(ctx context.Context) ([]*domain.Reservation, error)
	UpdateReservation(ctx context.Context, reservation *domain.Reservation) error
	DeleteReservation(ctx context.Context, id string) error
}
