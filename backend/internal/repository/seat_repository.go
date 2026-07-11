package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
)

type SeatRepository interface {
	GetByID(ctx context.Context, id string) (*domain.Seat, error)
	GetByAircraftIDAndSeatNumber(ctx context.Context, aircraftID, seatNumber string) (*domain.Seat, error)
	GetByAircraftID(ctx context.Context, aircraftID string) ([]*domain.Seat, error)
	CreateSeat(ctx context.Context, seat *domain.Seat) error
	UpdateSeat(ctx context.Context, seat *domain.Seat) error
	DeleteSeat(ctx context.Context, id string) error
}
