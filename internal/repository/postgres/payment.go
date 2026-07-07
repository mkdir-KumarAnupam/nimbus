package postgres

import (
	"context"
	"errors"

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

func (repo *PaymentRepository) GetPaymentByGatewayOrderID(
	ctx context.Context,
	orderID string,
) (*domain.Payment, error) {
	var payment domain.Payment

	err := repo.db.WithContext(ctx).Where("gateway_order_id = ?", orderID).First(&payment).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}

		return nil, err
	}

	return &payment, nil
}

func (repo *PaymentRepository) GetLatestPaymentByReservationID(ctx context.Context, reservationID string) (*domain.Payment, error) {
	var payment domain.Payment

	err := repo.db.WithContext(ctx).
		Where("reservation_id = ?", reservationID).
		Order("attempt DESC").
		First(&payment).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &payment, nil
}

func (repo *PaymentRepository) GetPaymentAttemptsCount(ctx context.Context,
	reservationID string,
) (int, error) {
	var count int64
	err := repo.db.WithContext(ctx).
		Model(&domain.Payment{}).
		Where("reservation_id = ?", reservationID).
		Count(&count).Error

	if err != nil {
		return 0, err
	}

	return int(count), err
}
