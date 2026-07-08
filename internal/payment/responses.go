package payment

import "github.com/mkdir-KumarAnupam/airline-booking/internal/domain"

type CreateOrderResponse struct {
	OrderID  string
	Amount   int64
	Currency string
}

type CreatePaymentResponse struct {
	OrderID  string
	Amount   int64
	Currency string
	KeyID    string
}

type RefundResponse struct {
	RefundID  string
	PaymentID string
	Amount    int64
	Currency  string
	Status    string
}

type RequestRefundResponse struct {
	RefundID string
	Status   domain.RefundStatus
}
