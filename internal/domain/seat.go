package domain

type SeatClass string

const (
	SeatEconomy        SeatClass = "economy"
	SeatPremiumEconomy SeatClass = "premium_economy"
	SeatBusiness       SeatClass = "business"
	SeatFirst          SeatClass = "first"
)

type Seat struct {
	ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
	AircraftID string    `gorm:"type:uuid;not null;index" json:"aircraftId"`
	SeatNumber string    `gorm:"not null" json:"seatNumber"`
	Class      SeatClass `gorm:"type:text;not null" json:"class"`
}
