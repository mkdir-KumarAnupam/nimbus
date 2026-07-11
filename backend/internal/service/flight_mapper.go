package service

import (
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
)

func flightToResponse(flight *domain.Flight) *dto.FlightResponse {
	return &dto.FlightResponse{
		ID:                   flight.ID,
		FlightNumber:         flight.FlightNumber,
		AircraftID:           flight.AircraftID,
		OriginAirportID:      flight.OriginAirportID,
		DestinationAirportID: flight.DestinationAirportID,
		DepartureTime:        flight.DepartureTime,
		ArrivalTime:          flight.ArrivalTime,
		Status:               string(flight.Status),
	}
}
