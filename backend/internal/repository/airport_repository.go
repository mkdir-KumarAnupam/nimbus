package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type AirportRepository interface {
	GetByID(ctx context.Context, id string) (*domain.Airport, error)
	GetByCode(ctx context.Context, code string) (*domain.Airport, error)

	ListAirports(ctx context.Context) ([]*domain.Airport, error)
	SearchAirports(ctx context.Context, query string, limit int) ([]*domain.Airport, error)

	CreateAirport(ctx context.Context, airport *domain.Airport) error
	UpdateAirport(ctx context.Context, airport *domain.Airport) error
	DeleteAirport(ctx context.Context, id string) error
}
