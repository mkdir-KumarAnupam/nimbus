package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type FlightRepository interface {
	CreateFlight(ctx context.Context, flight *domain.Flight) error
	GetByID(ctx context.Context, id string) (*domain.Flight, error)
	GetByFlightNumber(ctx context.Context, number string) (*domain.Flight, error)
	ListFlights(ctx context.Context) ([]*domain.Flight, error)
	UpdateFlight(ctx context.Context, flight *domain.Flight) error
	DeleteFlight(ctx context.Context, id string) error
}
