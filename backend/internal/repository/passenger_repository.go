package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
)

type PassengerRepository interface {
	CreatePassenger(ctx context.Context, passenger *domain.Passenger) error
	GetPassengerByID(ctx context.Context, id string) (*domain.Passenger, error)
	GetPassengersByReservationID(ctx context.Context, reservationID string) ([]*domain.Passenger, error)
	UpdatePassenger(ctx context.Context, passenger *domain.Passenger) error
	DeletePassenger(ctx context.Context, id string) error
}
