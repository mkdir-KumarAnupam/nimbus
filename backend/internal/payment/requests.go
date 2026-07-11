package payment

import (
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
)

type CreateOrderRequest struct {
	Amount   int64
	Currency string
	Receipt  string
}

type VerifySignatureRequest struct {
	OrderID   string
	PaymentID string
	Signature string
}

type CreatePaymentRequest struct {
	ReservationID string `json:"reservation_id"`
}

type RefundRequest struct {
	PaymentID string
	Amount    int64
}

type RequestRefundRequest struct {
	PaymentID string
	Reason    domain.RefundReason
}

type RefundDetails struct {
	ID        string `json:"id"`
	PaymentID string `json:"payment_id"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Status    string `json:"status"`
}
