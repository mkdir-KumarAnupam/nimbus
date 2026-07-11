package domain

import "time"

type RefundStatus string

const (
	RefundPending   RefundStatus = "pending"
	RefundSucceeded RefundStatus = "succeeded"
	RefundFailed    RefundStatus = "failed"
)

type RefundReason string

const (
	RefundReasonBookingFailure       RefundReason = "booking_failure"
	RefundReasonCustomerCancellation RefundReason = "customer_cancellation"
)

type Refund struct {
	ID string

	PaymentID string

	GatewayRefundID *string

	Amount int64

	Currency string

	Reason RefundReason

	Status RefundStatus

	CreatedAt time.Time
	UpdatedAt time.Time
}
