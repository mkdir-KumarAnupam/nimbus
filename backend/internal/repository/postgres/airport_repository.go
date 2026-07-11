package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"gorm.io/gorm"
)

type AirportRepository struct {
	db *gorm.DB
}

func NewAirportRepository(db *gorm.DB) *AirportRepository {
	return &AirportRepository{db: db}
}

func (r *AirportRepository) CreateAirport(ctx context.Context, airport *domain.Airport) error {
	return r.db.WithContext(ctx).Create(airport).Error
}

func (r *AirportRepository) GetByID(ctx context.Context, id string) (*domain.Airport, error) {
	var airport domain.Airport

	err := r.db.WithContext(ctx).First(&airport, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &airport, nil
}

func (r *AirportRepository) GetByCode(ctx context.Context, code string) (*domain.Airport, error) {
	var airport domain.Airport

	err := r.db.WithContext(ctx).First(&airport, "airport_code = ?", code).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &airport, nil
}

func (r *AirportRepository) ListAllAirports(ctx context.Context) ([]domain.Airport, error) {
	var airports []domain.Airport
	err := r.db.WithContext(ctx).Find(&airports).Error
	if err != nil {
		return nil, err
	}
	return airports, nil
}

func (r *AirportRepository) UpdateAirport(ctx context.Context, airport *domain.Airport) error {
	result := r.db.WithContext(ctx).Model(&domain.Airport{}).Where("id = ?", airport.ID).Updates(airport).Error
	return result
}

func (r *AirportRepository) DeleteAirport(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Delete(&domain.Airport{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrAirportNotFound
	}

	return nil
}

func (r *AirportRepository) ListAirports(ctx context.Context) ([]*domain.Airport, error) {
	var airports []*domain.Airport

	err := r.db.WithContext(ctx).
		Order("airport_city ASC").
		Find(&airports).Error
	if err != nil {
		return nil, err
	}

	return airports, nil
}

func (r *AirportRepository) SearchAirports(
	ctx context.Context,
	query string,
	limit int,
) ([]*domain.Airport, error) {

	var airports []*domain.Airport

	db := r.db.WithContext(ctx)

	if limit > 0 {
		db = db.Limit(limit)
	}

	err := db.
		Where(`
        airport_code ILIKE ? OR
        airport_name ILIKE ? OR
        airport_city ILIKE ? OR
        airport_country ILIKE ?
    `,
			query+"%",
			query+"%",
			query+"%",
			query+"%",
		).
		Order("airport_city ASC").
		Find(&airports).Error

	if err != nil {
		return nil, err
	}

	return airports, nil
}
