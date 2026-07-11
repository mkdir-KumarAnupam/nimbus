package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"gorm.io/gorm"
)

type PassengerRepository struct {
	db *gorm.DB
}

func NewPassengerRepository(db *gorm.DB) *PassengerRepository {
	return &PassengerRepository{db: db}
}

func (repo *PassengerRepository) CreatePassenger(ctx context.Context, passenger *domain.Passenger) error {
	return repo.db.WithContext(ctx).Create(passenger).Error
}

func (repo *PassengerRepository) GetPassengerByID(ctx context.Context, id string) (*domain.Passenger, error) {
	var passenger domain.Passenger

	err := repo.db.WithContext(ctx).
		Where("id = ?", id).
		First(&passenger).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &passenger, nil
}

func (repo *PassengerRepository) GetPassengersByReservationID(ctx context.Context, reservationID string) ([]*domain.Passenger, error) {
	var passengers []*domain.Passenger
	err := repo.db.WithContext(ctx).
		Where("reservation_id = ?", reservationID).
		Order("created_at ASC").
		Find(&passengers).Error

	if err != nil {
		return nil, err
	}

	return passengers, nil
}

func (repo *PassengerRepository) UpdatePassenger(ctx context.Context, passenger *domain.Passenger) error {
	return repo.db.WithContext(ctx).
		Model(&domain.Passenger{}).
		Where("id = ?", passenger.ID).
		Updates(passenger).Error
}

func (repo *PassengerRepository) DeletePassenger(ctx context.Context, id string) error {
	result := repo.db.WithContext(ctx).
		Delete(&domain.Passenger{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrPassengerNotFound
	}

	return nil
}
