package dto

import "time"

type UpdateFlightRequest struct {
	AircraftID string `json:"aircraftId"`

	OriginAirportID      string `json:"originAirportId"`
	DestinationAirportID string `json:"destinationAirportId"`

	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`

	Status string `json:"status"`
}
