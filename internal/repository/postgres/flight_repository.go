package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"gorm.io/gorm"
)

type FlightRepository struct {
	db *gorm.DB
}

func NewFlightRepository(db *gorm.DB) *FlightRepository {
	return &FlightRepository{db: db}
}

func (r *FlightRepository) CreateFlight(ctx context.Context, flight *domain.Flight) error {
	return r.db.WithContext(ctx).Create(flight).Error
}

func (r *FlightRepository) GetByID(ctx context.Context, id string) (*domain.Flight, error) {
	var flight domain.Flight

	err := r.db.WithContext(ctx).First(&flight, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &flight, nil
}

func (r *FlightRepository) GetByFlightNumber(ctx context.Context, flightNumber string) (*domain.Flight, error) {
	var flight domain.Flight

	err := r.db.WithContext(ctx).First(&flight, "flight_number = ?", flightNumber).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &flight, nil
}

func (r *FlightRepository) ListFlights(ctx context.Context) ([]*domain.Flight, error) {
	var flights []*domain.Flight

	err := r.db.WithContext(ctx).Find(&flights).Error
	if err != nil {
		return nil, err
	}

	return flights, nil
}

func (r *FlightRepository) UpdateFlight(ctx context.Context, flight *domain.Flight) error {
	return r.db.WithContext(ctx).Model(&domain.Flight{}).Where("id = ?", flight.ID).Updates(flight).Error

}

func (r *FlightRepository) DeleteFlight(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Delete(&domain.Flight{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrFlightNotFound
	}

	return nil
}
