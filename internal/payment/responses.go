package payment

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
