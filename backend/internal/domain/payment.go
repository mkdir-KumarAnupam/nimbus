package domain

import "time"

type PaymentStatus string

const (
	PaymentPending       PaymentStatus = "pending"
	PaymentSucceeded     PaymentStatus = "succeeded"
	PaymentFailed        PaymentStatus = "failed"
	PaymentRefunded      PaymentStatus = "refunded"
	PaymentCreating      PaymentStatus = "creating"
	PaymentGatewayFailed PaymentStatus = "gateway-failed"
)

type Payment struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	ReservationID string `gorm:"type:uuid;not null;index" json:"reservation_id"`

	Amount int64 `gorm:"not null" json:"amount"`

	Currency string `gorm:"type:varchar(3);not null" json:"currency"`

	Status PaymentStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`

	Gateway string `gorm:"type:varchar(50);not null" json:"gateway"`

	GatewayOrderID *string `gorm:"type:varchar(255);uniqueIndex" json:"gateway_order_id"`

	GatewayPaymentID *string `gorm:"type:varchar(255)" json:"gateway_payment_id"`

	Receipt string `gorm:"type:varchar(100);uniqueIndex;not null" json:"receipt"`

	Attempt int `gorm:"not null" json:"attempt"`

	CreatedAt time.Time `gorm:"not null" json:"created_at"`

	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}
