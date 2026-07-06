package postgres

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{
		db: db,
	}
}

func (repo *PaymentRepository) CreatePayment(ctx context.Context, payment *domain.Payment) error {
	return repo.db.WithContext(ctx).Create(payment).Error
}

func (repo *PaymentRepository) GetPaymentByID(ctx context.Context, id string) (*domain.Payment, error) {
	var payment domain.Payment

	err := repo.db.WithContext(ctx).
		Where("id = ?", id).
		First(&payment).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}

		return nil, err
	}

	return &payment, nil
}

func (repo *PaymentRepository) GetPaymentByReservationID(ctx context.Context, reservationID string) (*domain.Payment, error) {
	var payment domain.Payment

	err := repo.db.WithContext(ctx).
		Where("reservation_id = ?", reservationID).
		First(&payment).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}

		return nil, err
	}

	return &payment, nil
}

func (repo *PaymentRepository) UpdatePayment(ctx context.Context, payment *domain.Payment) error {
	return repo.db.WithContext(ctx).Save(payment).Error
}

func (repo *PaymentRepository) PaymentExists(ctx context.Context, id string) (bool, error) {
	var count int64

	err := repo.db.WithContext(ctx).
		Model(&domain.Payment{}).
		Where("id = ?", id).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
