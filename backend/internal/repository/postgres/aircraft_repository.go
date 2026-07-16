package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"gorm.io/gorm"
)

type AircraftRepository struct {
	db *gorm.DB
}

func NewAircraftRepository(db *gorm.DB) *AircraftRepository {
	return &AircraftRepository{db: db}
}

func (r *AircraftRepository) CreateAircraft(ctx context.Context, aircraft *domain.Aircraft) error {
	return r.db.WithContext(ctx).Create(aircraft).Error
}

func (r *AircraftRepository) GetByID(ctx context.Context, id string) (*domain.Aircraft, error) {
	var aircraft domain.Aircraft

	err := r.db.WithContext(ctx).First(&aircraft, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &aircraft, nil
}

func (r *AircraftRepository) GetByRegistration(ctx context.Context, registration string) (*domain.Aircraft, error) {
	var aircraft domain.Aircraft

	err := r.db.WithContext(ctx).First(&aircraft, "registration = ?", registration).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &aircraft, nil
}

func (r *AircraftRepository) UpdateAircraft(ctx context.Context, aircraft *domain.Aircraft) error {
	result := r.db.WithContext(ctx).Model(&domain.Aircraft{}).Where("id = ?", aircraft.ID).Updates(aircraft).Error
	return result
}

func (r *AircraftRepository) DeleteAircraft(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Delete(&domain.Aircraft{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errs.ErrAircraftNotFound
	}

	return nil
}
