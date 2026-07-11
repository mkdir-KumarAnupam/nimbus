package postgres

import (
	"context"
	"errors"
	"time"

	domain "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
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

func (r *FlightRepository) SearchFlights(
	ctx context.Context,
	departureAirportID string,
	arrivalAirportID string,
	departureDate time.Time,
	passengers int,
	orderBy string,
	cabinClass domain.CabinClass,
) ([]*dto.FlightSearchResult, error) {
	var flights []*dto.FlightSearchResult

	if passengers == 0 {
		return nil, errs.ErrFlightNotFound
	}

	start := time.Date(
		departureDate.Year(),
		departureDate.Month(),
		departureDate.Day(),
		0, 0, 0, 0,
		time.UTC,
	)

	end := start.Add(24 * time.Hour)

	sortMap := map[string]string{
		"departure":      "flights.departure_time ASC",
		"departure_desc": "flights.departure_time DESC",
		"price":          "lowest_price ASC",
		"price_desc":     "lowest_price DESC",
		"seats":          "available_seats DESC",
	}

	order, ok := sortMap[orderBy]
	if !ok {
		order = "flights.departure_time ASC"
	}

	query := r.db.WithContext(ctx).
		Model(&domain.Flight{}).
		Select(`
			flights.*,
			COUNT(flight_seats.id) AS available_seats,
			MIN(flight_seats.price) AS lowest_price
		`).
		Joins(`
			JOIN flight_seats
				ON flight_seats.flight_id = flights.id
		`).
		Joins(`
			JOIN seats
				ON seats.id = flight_seats.seat_id
		`).
		Where("flights.origin_airport_id = ?", departureAirportID).
		Where("flights.destination_airport_id = ?", arrivalAirportID).
		Where("flights.status = ?", domain.FlightScheduled).
		Where("flights.departure_time >= ?", start).
		Where("flights.departure_time < ?", end).
		Where("flight_seats.status = ?", domain.SeatAvailable).
		Where("seats.class = ?", cabinClass).
		Group("flights.id").
		Having("COUNT(flight_seats.id) >= ?", passengers).
		Order(order)

	err := query.Find(&flights).Error
	if err != nil {
		return nil, err
	}

	return flights, nil
}
