package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"gorm.io/gorm"
)

type FlightSeatRepository struct {
	db *gorm.DB
}

func NewFlightSeatRepository(db *gorm.DB) *FlightSeatRepository {
	return &FlightSeatRepository{db: db}
}

func (r *FlightSeatRepository) WithTx(tx *gorm.DB) *FlightSeatRepository {
	return &FlightSeatRepository{
		db: tx,
	}
}

func (r *FlightSeatRepository) CreateFlightSeat(ctx context.Context, flightSeat *domain.FlightSeat) error {
	return r.db.WithContext(ctx).Create(flightSeat).Error
}

func (r *FlightSeatRepository) CreateFlightSeats(ctx context.Context, flightSeats []*domain.FlightSeat) error {
	return r.db.WithContext(ctx).Create(flightSeats).Error
}

func (r *FlightSeatRepository) GetByID(ctx context.Context, id string) (*domain.FlightSeat, error) {
	var flightSeat domain.FlightSeat

	err := r.db.WithContext(ctx).First(&flightSeat, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &flightSeat, nil
}

func (r *FlightSeatRepository) GetByFlightIDAndSeatID(ctx context.Context, flightID, seatID string) (*domain.FlightSeat, error) {
	var flightSeat domain.FlightSeat

	err := r.db.WithContext(ctx).First(&flightSeat, "flight_id = ? AND seat_id = ?", flightID, seatID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &flightSeat, nil
}

func (r *FlightSeatRepository) GetByFlightID(
	ctx context.Context,
	flightID string,
) ([]*domain.FlightSeat, error) {
	var flightSeats []*domain.FlightSeat

	err := r.db.WithContext(ctx).
		Preload("Seat").
		Where("flight_id = ?", flightID).
		Find(&flightSeats).Error

	if err != nil {
		return nil, err
	}

	return flightSeats, nil
}

func (r *FlightSeatRepository) UpdateFlightSeat(ctx context.Context, flightSeat *domain.FlightSeat) error {
	result := r.db.WithContext(ctx).Model(&domain.FlightSeat{}).Where("id = ?", flightSeat.ID).Updates(flightSeat).Error
	return result
}

func (r *FlightSeatRepository) DeleteFlightSeat(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Delete(&domain.FlightSeat{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrFlightSeatNotFound
	}

	return nil
}

func (r *FlightSeatRepository) ExistsByFlightID(ctx context.Context, flightID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.FlightSeat{}).Where("flight_id = ?", flightID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
