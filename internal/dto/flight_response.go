package dto

import "time"

type FlightResponse struct {
	ID string `json:"id"`

	FlightNumber string `json:"flightNumber"`

	AircraftID string `json:"aircraftId"`

	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`

	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`

	Status string `json:"status"`
}
