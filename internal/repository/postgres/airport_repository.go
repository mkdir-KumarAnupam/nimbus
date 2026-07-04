package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
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
