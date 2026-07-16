package postgres

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	"gorm.io/gorm"
)

type savedPassengerRepository struct {
	db *gorm.DB
}

func NewSavedPassengerRepository(db *gorm.DB) repository.SavedPassengerRepository {
	return &savedPassengerRepository{db: db}
}

func (r *savedPassengerRepository) Create(ctx context.Context, passenger *domain.SavedPassenger) error {
	return r.db.WithContext(ctx).Create(passenger).Error
}

func (r *savedPassengerRepository) GetByID(ctx context.Context, id string) (*domain.SavedPassenger, error) {
	var passenger domain.SavedPassenger
	if err := r.db.WithContext(ctx).First(&passenger, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &passenger, nil
}

func (r *savedPassengerRepository) GetByUserID(ctx context.Context, userID string) ([]domain.SavedPassenger, error) {
	var passengers []domain.SavedPassenger
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC").Find(&passengers).Error; err != nil {
		return nil, err
	}
	return passengers, nil
}

func (r *savedPassengerRepository) Update(ctx context.Context, passenger *domain.SavedPassenger) error {
	return r.db.WithContext(ctx).Save(passenger).Error
}

func (r *savedPassengerRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&domain.SavedPassenger{}, "id = ?", id).Error
}
