package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/validation"
)

type FlightService struct {
	flightRepository   repository.FlightRepository
	airportRepository  repository.AirportRepository
	aircraftRepository repository.AircraftRepository
}

func NewFlightService(flightRepository repository.FlightRepository, airportRepository repository.AirportRepository, aircraftRepository repository.AircraftRepository) *FlightService {
	return &FlightService{
		flightRepository:   flightRepository,
		airportRepository:  airportRepository,
		aircraftRepository: aircraftRepository,
	}
}

func (s *FlightService) CreateFlight(ctx context.Context, request *dto.CreateFlightRequest) error {
	if err := validation.ValidateCreateFlightRequest(request); err != nil {
		return err
	}
	if exist, err := s.flightRepository.GetByFlightNumber(ctx, request.FlightNumber); err != nil {
		return err
	} else if exist != nil {
		return errs.ErrFlightAlreadyExists
	}

	if exist, err := s.airportRepository.GetByID(ctx, request.OriginAirportID); err != nil {
		return err
	} else if exist == nil {
		return errs.ErrAirportNotFound
	}

	if exist, err := s.airportRepository.GetByID(ctx, request.DestinationAirportID); err != nil {
		return err
	} else if exist == nil {
		return errs.ErrAirportNotFound
	}

	aircraft, err := s.aircraftRepository.GetByID(ctx, request.AircraftID)
	if err != nil {
		return err
	}

	if aircraft == nil {
		return errs.ErrAircraftNotFound
	}

	if aircraft.Status != domain.AircraftActive {
		return errs.ErrAircraftInactive
	}

	flight := &domain.Flight{
		ID:                   uuid.NewString(),
		FlightNumber:         request.FlightNumber,
		AircraftID:           request.AircraftID,
		OriginAirportID:      request.OriginAirportID,
		DestinationAirportID: request.DestinationAirportID,
		DepartureTime:        request.DepartureTime,
		ArrivalTime:          request.ArrivalTime,
		Status:               domain.FlightScheduled,
	}

	return s.flightRepository.CreateFlight(ctx, flight)
}

func (s *FlightService) GetFlightByID(ctx context.Context, id string) (*dto.FlightResponse, error) {
	flight, err := s.flightRepository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if flight == nil {
		return nil, errs.ErrFlightNotFound
	}

	return flightToResponse(flight), nil
}

func (s *FlightService) GetFlightByFlightNumber(ctx context.Context, flightNumber string) (*dto.FlightResponse, error) {
	flight, err := s.flightRepository.GetByFlightNumber(ctx, flightNumber)
	if err != nil {
		return nil, err
	}

	if flight == nil {
		return nil, errs.ErrFlightNotFound
	}

	return flightToResponse(flight), nil
}

func (s *FlightService) ListFlights(ctx context.Context) ([]*dto.FlightResponse, error) {
	flights, err := s.flightRepository.ListFlights(ctx)
	if err != nil {
		return nil, err
	}
	responses := make([]*dto.FlightResponse, len(flights))
	for i, flight := range flights {
		responses[i] = flightToResponse(flight)
	}

	return responses, nil
}

func (s *FlightService) UpdateFlight(ctx context.Context, flightID string, request *dto.UpdateFlightRequest) error {

	flight, err := s.flightRepository.GetByID(ctx, flightID)
	if err != nil {
		return err
	}

	if flight == nil {
		return errs.ErrFlightNotFound
	}

	if err := validation.ValidateUpdateFlightRequest(request); err != nil {
		return err
	}

	if exist, err := s.airportRepository.GetByID(ctx, request.OriginAirportID); err != nil {
		return err
	} else if exist == nil {
		return errs.ErrAirportNotFound
	}

	if exist, err := s.airportRepository.GetByID(ctx, request.DestinationAirportID); err != nil {
		return err
	} else if exist == nil {
		return errs.ErrAirportNotFound
	}

	aircraft, err := s.aircraftRepository.GetByID(ctx, request.AircraftID)
	if err != nil {
		return err
	}

	if aircraft == nil {
		return errs.ErrAircraftNotFound
	}

	if aircraft.Status != domain.AircraftActive {
		return errs.ErrAircraftInactive
	}

	flight.AircraftID = request.AircraftID
	flight.DestinationAirportID = request.DestinationAirportID
	flight.OriginAirportID = request.OriginAirportID
	flight.DepartureTime = request.DepartureTime
	flight.ArrivalTime = request.ArrivalTime
	flight.Status = domain.FlightStatus(request.Status)

	return s.flightRepository.UpdateFlight(ctx, flight)

}

func (s *FlightService) DeleteFlight(ctx context.Context, id string) error {
	return s.flightRepository.DeleteFlight(ctx, id)
}
