package dto

import (
	"time"

	domain2 "github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
)

type FlightSearchResponse struct {
	FlightID     string `json:"flightId"`
	FlightNumber string `json:"flightNumber"`

	DepartureAirportCode string `json:"departureAirportCode"`
	ArrivalAirportCode   string `json:"arrivalAirportCode"`

	Status        domain2.FlightStatus `json:"status"`
	DepartureTime time.Time            `json:"departureTime"`
	ArrivalTime   time.Time            `json:"arrivalTime"`

	DurationMinutes int `json:"durationMinutes"`

	AvailableSeats int   `json:"availableSeats"`
	LowestPrice    int64 `json:"lowestPrice"`
}

type FlightSearchRequest struct {
	DepartureAirportCode string             `json:"departureAirportCode"`
	ArrivalAirportCode   string             `json:"arrivalAirportCode"`
	DepartureDate        time.Time          `json:"departureDate"`
	Passengers           int                `json:"passengers"`
	CabinClass           domain2.CabinClass `json:"cabinClass"`
	OrderBy              string             `json:"orderBy,omitempty"`
}

type FlightSearchResult struct {
	domain2.Flight

	AvailableSeats int   `gorm:"column:available_seats"`
	LowestPrice    int64 `gorm:"column:lowest_price"`
}
