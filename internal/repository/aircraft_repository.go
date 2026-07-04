package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type AircraftRepository interface {
	GetByID(ctx context.Context, id string) (*domain.Aircraft, error)
	GetByRegistration(ctx context.Context, registration string) (*domain.Aircraft, error)
	CreateAircraft(ctx context.Context, aircraft *domain.Aircraft) error
	UpdateAircraft(ctx context.Context, aircraft *domain.Aircraft) error
	DeleteAircraft(ctx context.Context, id string) error
}
