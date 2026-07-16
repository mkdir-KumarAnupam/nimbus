package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"gorm.io/gorm"
)

type SeatRepository struct {
	db *gorm.DB
}

func NewSeatRepository(db *gorm.DB) *SeatRepository {
	return &SeatRepository{db: db}
}

func (r *SeatRepository) CreateSeat(ctx context.Context, seat *domain.Seat) error {
	return r.db.WithContext(ctx).Create(seat).Error
}

func (r *SeatRepository) GetByID(ctx context.Context, id string) (*domain.Seat, error) {
	var seat domain.Seat

	err := r.db.WithContext(ctx).First(&seat, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &seat, nil
}

func (r *SeatRepository) GetByAircraftIDAndSeatNumber(ctx context.Context, aircraftID, seatNumber string) (*domain.Seat, error) {
	var seat domain.Seat

	err := r.db.WithContext(ctx).First(&seat, "aircraft_id = ? AND seat_number = ?", aircraftID, seatNumber).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &seat, nil
}

func (r *SeatRepository) GetByAircraftID(ctx context.Context, aircraftID string) ([]*domain.Seat, error) {
	var seats []*domain.Seat

	err := r.db.WithContext(ctx).Find(&seats, "aircraft_id = ?", aircraftID).Error
	if err != nil {
		return nil, err
	}

	return seats, nil
}

func (r *SeatRepository) UpdateSeat(ctx context.Context, seat *domain.Seat) error {
	result := r.db.WithContext(ctx).Model(&domain.Seat{}).Where("id = ?", seat.ID).Updates(seat).Error
	return result
}

func (r *SeatRepository) DeleteSeat(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Delete(&domain.Seat{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrSeatNotFound
	}

	return nil
}
