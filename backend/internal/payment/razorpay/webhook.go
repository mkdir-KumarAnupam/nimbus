package razorpay

type WebhookEvent struct {
	Event   string         `json:"event"`
	Payload WebhookPayload `json:"payload"`
}

type WebhookPayload struct {
	Payment PaymentPayload `json:"payment"`
	Refund  RefundPayload  `json:"refund"`
}

type PaymentPayload struct {
	Entity PaymentEntity `json:"entity"`
}

type RefundPayload struct {
	Entity RefundEntity `json:"entity"`
}

type PaymentEntity struct {
	ID      string `json:"id"`
	OrderID string `json:"order_id"`
	Status  string `json:"status"`
}

type RefundEntity struct {
	ID string `json:"id"`
}
