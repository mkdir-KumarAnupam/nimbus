package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type RefundRepository interface {
	CreateRefund(
		ctx context.Context,
		refund *domain.Refund,
	) error

	UpdateRefund(
		ctx context.Context,
		refund *domain.Refund,
	) error

	GetRefundByID(
		ctx context.Context,
		id string,
	) (*domain.Refund, error)

	GetRefundByGatewayRefundID(
		ctx context.Context,
		gatewayRefundID string,
	) (*domain.Refund, error)

	GetRefundByPaymentID(
		ctx context.Context,
		paymentID string,
	) (*domain.Refund, error)

	GetRefundsByPaymentID(
		ctx context.Context,
		paymentID string,
	) ([]*domain.Refund, error)

	GetLatestRefundByPaymentID(
		ctx context.Context,
		paymentID string,
	) (*domain.Refund, error)
}
