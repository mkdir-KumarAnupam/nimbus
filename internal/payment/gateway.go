package payment

import "context"

type PaymentGateway interface {
	CreateOrder(ctx context.Context, req CreateOrderRequest) (*CreateOrderResponse, error)

	VerifyWebhookSignature(
		body []byte,
		signature string,
	) error

	GetPayment(ctx context.Context, paymentID string) (*PaymentDetails, error)

	GetRefund(ctx context.Context, refundID string) (*RefundDetails, error)

	RefundPayment(ctx context.Context, req RefundRequest) (*RefundResponse, error)
}
