package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type SavedPassengerRepository interface {
	Create(ctx context.Context, passenger *domain.SavedPassenger) error
	GetByID(ctx context.Context, id string) (*domain.SavedPassenger, error)
	GetByUserID(ctx context.Context, userID string) ([]domain.SavedPassenger, error)
	Update(ctx context.Context, passenger *domain.SavedPassenger) error
	Delete(ctx context.Context, id string) error
}
