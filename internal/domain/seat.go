package domain

import "time"

type SeatClass string

const (
	SeatEconomy        SeatClass = "economy"
	SeatPremiumEconomy SeatClass = "premium_economy"
	SeatBusiness       SeatClass = "business"
	SeatFirst          SeatClass = "first"
)

type Seat struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	AircraftID string `gorm:"type:uuid;not null;uniqueIndex:idx_aircraft_seat" json:"aircraftId"`
	SeatNumber string `gorm:"not null;uniqueIndex:idx_aircraft_seat" json:"seatNumber"`

	Class SeatClass `gorm:"type:text;not null" json:"class"`
}

type SeatStatus string

const (
	SeatAvailable SeatStatus = "available"
	SeatHeld      SeatStatus = "held"
	SeatBooked    SeatStatus = "booked"
	SeatBlocked   SeatStatus = "blocked"
)

type FlightSeat struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	FlightID string `gorm:"type:uuid;not null;index;uniqueIndex:idx_flight_seat" json:"flightId"`
	SeatID   string `gorm:"type:uuid;not null;index;uniqueIndex:idx_flight_seat" json:"seatId"`

	Status SeatStatus `gorm:"type:text;not null;default:'available'" json:"status"`

	Price int64 `gorm:"not null" json:"price"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
