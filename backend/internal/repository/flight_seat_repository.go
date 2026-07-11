package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
)

type FlightSeatRepository interface {
	GetByID(ctx context.Context, id string) (*domain.FlightSeat, error)
	GetByFlightIDAndSeatID(ctx context.Context, flightID, seatID string) (*domain.FlightSeat, error)
	GetByFlightID(ctx context.Context, flightID string) ([]*domain.FlightSeat, error)
	CreateFlightSeat(ctx context.Context, flightSeat *domain.FlightSeat) error
	CreateFlightSeats(ctx context.Context, flightSeats []*domain.FlightSeat) error
	UpdateFlightSeat(ctx context.Context, flightSeat *domain.FlightSeat) error
	DeleteFlightSeat(ctx context.Context, id string) error
	ExistsByFlightID(ctx context.Context, flightID string) (bool, error)
}
