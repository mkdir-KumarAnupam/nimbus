package payment

import "context"

type PaymentGateway interface {
	CreateOrder(ctx context.Context, req CreateOrderRequest) (*CreateOrderResponse, error)

	VerifyWebhookSignature(
		body []byte,
		signature string,
	) error

	GetPayment(ctx context.Context, paymentID string) (*PaymentDetails, error)

	//Refund(ctx context.Context, paymentID string, amount int64) error
}
