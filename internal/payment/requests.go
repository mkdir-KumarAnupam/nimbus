package payment

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
