package payment

import "context"

type PaymentGateway interface {
	CreateOrder(ctx context.Context, req CreateOrderRequest) (*CreateOrderResponse, error)

	//Will be implemented
	//VerifySignature(ctx context.Context, req VerifySignatureRequest) error
	//
	//Refund(ctx context.Context, paymentID string, amount int64) error
}
