package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"gorm.io/gorm"
)

type ReservationRepository struct {
	db *gorm.DB
}

func NewReservationRepository(db *gorm.DB) *ReservationRepository {
	return &ReservationRepository{db: db}
}

func (repo *ReservationRepository) CreateReservation(ctx context.Context, reservation *domain.Reservation) error {
	return repo.db.WithContext(ctx).Create(reservation).Error
}

func (repo *ReservationRepository) GetReservationByID(ctx context.Context, id string) (*domain.Reservation, error) {
	var reservation domain.Reservation

	err := repo.db.WithContext(ctx).
		Where("id = ?", id).
		First(&reservation).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &reservation, nil

}

func (repo *ReservationRepository) ListReservations(ctx context.Context) ([]*domain.Reservation, error) {
	var reservations []*domain.Reservation
	err := repo.db.WithContext(ctx).
		Find(&reservations).Error
	if err != nil {
		return nil, err

	}

	return reservations, nil
}

func (repo *ReservationRepository) ReservationRefExists(ctx context.Context, reservationRef string) (bool, error) {
	var reservation domain.Reservation

	err := repo.db.WithContext(ctx).
		Where("reservation_ref = ?", reservationRef).
		First(&reservation).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

func (repo *ReservationRepository) GetReservationsByUserID(ctx context.Context, id string) ([]*domain.Reservation, error) {
	var reservations []*domain.Reservation
	err := repo.db.WithContext(ctx).
		Where("user_id = ?", id).
		Order("created_at DESC").
		Find(&reservations).Error

	if err != nil {
		return nil, err
	}

	return reservations, nil

}

func (repo *ReservationRepository) GetReservationsByFlightID(ctx context.Context, id string) ([]*domain.Reservation, error) {
	var reservations []*domain.Reservation
	err := repo.db.WithContext(ctx).
		Where("flight_id = ?", id).
		Order("created_at DESC").
		Find(&reservations).Error

	if err != nil {
		return nil, err
	}

	return reservations, nil

}

func (repo *ReservationRepository) UpdateReservation(ctx context.Context, reservation *domain.Reservation) error {
	return repo.db.WithContext(ctx).
		Model(&domain.Reservation{}).
		Where("id = ?", reservation.ID).
		Updates(reservation).Error
}

func (repo *ReservationRepository) DeleteReservation(ctx context.Context, id string) error {
	result := repo.db.WithContext(ctx).
		Delete(&domain.Reservation{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrReservationNotFound
	}

	return nil
}
