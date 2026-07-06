package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type PaymentRepository interface {
	CreatePayment(ctx context.Context, payment *domain.Payment) error
	GetPaymentByID(ctx context.Context, id string) (*domain.Payment, error)
	GetPaymentByReservationID(ctx context.Context, reservationID string) (*domain.Payment, error)
	UpdatePayment(ctx context.Context, payment *domain.Payment) error
	PaymentExists(ctx context.Context, id string) (bool, error)
}
