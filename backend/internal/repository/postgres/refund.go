package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"gorm.io/gorm"
)

type RefundRepository struct {
	db *gorm.DB
}

func NewRefundRepository(db *gorm.DB) *RefundRepository {
	return &RefundRepository{db: db}
}

func (r *RefundRepository) GetRefundByID(
	ctx context.Context,
	id string,
) (*domain.Refund, error) {

	var refund domain.Refund

	err := r.db.WithContext(ctx).
		Where("id = ?", id).
		First(&refund).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &refund, nil
}

func (r *RefundRepository) GetRefundByGatewayRefundID(
	ctx context.Context,
	gatewayRefundID string,
) (*domain.Refund, error) {

	var refund domain.Refund

	err := r.db.WithContext(ctx).
		Where("gateway_refund_id = ?", gatewayRefundID).
		First(&refund).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &refund, nil
}

func (r *RefundRepository) CreateRefund(
	ctx context.Context,
	refund *domain.Refund,
) error {

	return r.db.WithContext(ctx).
		Create(refund).
		Error
}

func (r *RefundRepository) UpdateRefund(
	ctx context.Context,
	refund *domain.Refund,
) error {

	return r.db.WithContext(ctx).
		Save(refund).
		Error
}

func (r *RefundRepository) GetRefundsByPaymentID(
	ctx context.Context,
	paymentID string,
) ([]*domain.Refund, error) {

	var refunds []*domain.Refund

	err := r.db.WithContext(ctx).
		Where("payment_id = ?", paymentID).
		Order("created_at DESC").
		Find(&refunds).Error

	if err != nil {
		return nil, err
	}

	return refunds, nil
}

func (r *RefundRepository) GetLatestRefundByPaymentID(
	ctx context.Context,
	paymentID string,
) (*domain.Refund, error) {

	var refund domain.Refund

	err := r.db.WithContext(ctx).
		Where("payment_id = ?", paymentID).
		Order("created_at DESC").
		First(&refund).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &refund, nil
}

func (r *RefundRepository) GetRefundByPaymentID(
	ctx context.Context,
	paymentID string,
) (*domain.Refund, error) {

	var refund domain.Refund

	err := r.db.WithContext(ctx).
		Where("payment_id = ?", paymentID).
		First(&refund).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &refund, nil
}
