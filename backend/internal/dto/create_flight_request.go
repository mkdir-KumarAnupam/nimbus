package dto

import "time"

type CreateFlightRequest struct {
	FlightNumber string `json:"flightNumber"`
	AircraftID   string `json:"aircraftId"`

	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`

	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
}
