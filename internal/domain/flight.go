package domain

import "time"

type Flight struct {
	ID           string `gorm:"type:uuid;primaryKey" json:"id"`
	FlightNumber string `gorm:"uniqueIndex;not null" json:"flightNumber"`

	AircraftID           string `gorm:"type:uuid;not null;index" json:"aircraftId"`
	OriginAirportID      string `gorm:"type:uuid;not null;index" json:"originAirportId"`
	DestinationAirportID string `gorm:"type:uuid;not null;index" json:"destinationAirportId"`

	DepartureTime time.Time `gorm:"not null" json:"departureTime"`
	ArrivalTime   time.Time `gorm:"not null" json:"arrivalTime"`

	Status FlightStatus `gorm:"type:text;not null" json:"status"`
}

type FlightRepository interface {
}
