package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type PaymentRepository interface {
	CreatePayment(ctx context.Context, payment *domain.Payment) error
	GetPaymentByID(ctx context.Context, id string) (*domain.Payment, error)
	UpdatePayment(ctx context.Context, payment *domain.Payment) error
	PaymentExists(ctx context.Context, id string) (bool, error)
	GetPaymentByGatewayOrderID(
		ctx context.Context,
		orderID string,
	) (*domain.Payment, error)
	GetLatestPaymentByReservationID(
		ctx context.Context,
		reservationID string,
	) (*domain.Payment, error)

	GetPaymentAttemptsCount(
		ctx context.Context,
		reservationID string,
	) (int, error)
}
