package service

import (
	"context"

	"github.com/google/uuid"
	domain2 "github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	dto2 "github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	repository2 "github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/validation"
)

type FlightService struct {
	flightRepository   repository2.FlightRepository
	airportRepository  repository2.AirportRepository
	aircraftRepository repository2.AircraftRepository
}

func NewFlightService(flightRepository repository2.FlightRepository, airportRepository repository2.AirportRepository, aircraftRepository repository2.AircraftRepository) *FlightService {
	return &FlightService{
		flightRepository:   flightRepository,
		airportRepository:  airportRepository,
		aircraftRepository: aircraftRepository,
	}
}

func (s *FlightService) CreateFlight(ctx context.Context, request *dto2.CreateFlightRequest) error {
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

	if aircraft.Status != domain2.AircraftActive {
		return errs.ErrAircraftInactive
	}

	flight := &domain2.Flight{
		ID:                   uuid.NewString(),
		FlightNumber:         request.FlightNumber,
		AircraftID:           request.AircraftID,
		OriginAirportID:      request.OriginAirportID,
		DestinationAirportID: request.DestinationAirportID,
		DepartureTime:        request.DepartureTime,
		ArrivalTime:          request.ArrivalTime,
		Status:               domain2.FlightScheduled,
	}

	return s.flightRepository.CreateFlight(ctx, flight)
}

func (s *FlightService) GetFlightByID(ctx context.Context, id string) (*dto2.FlightResponse, error) {
	flight, err := s.flightRepository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if flight == nil {
		return nil, errs.ErrFlightNotFound
	}

	return flightToResponse(flight), nil
}

func (s *FlightService) GetFlightByFlightNumber(ctx context.Context, flightNumber string) (*dto2.FlightResponse, error) {
	flight, err := s.flightRepository.GetByFlightNumber(ctx, flightNumber)
	if err != nil {
		return nil, err
	}

	if flight == nil {
		return nil, errs.ErrFlightNotFound
	}

	return flightToResponse(flight), nil
}

func (s *FlightService) ListFlights(ctx context.Context) ([]*dto2.FlightResponse, error) {
	flights, err := s.flightRepository.ListFlights(ctx)
	if err != nil {
		return nil, err
	}
	responses := make([]*dto2.FlightResponse, len(flights))
	for i, flight := range flights {
		responses[i] = flightToResponse(flight)
	}

	return responses, nil
}

func (s *FlightService) UpdateFlight(ctx context.Context, flightID string, request *dto2.UpdateFlightRequest) error {

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

	if aircraft.Status != domain2.AircraftActive {
		return errs.ErrAircraftInactive
	}

	flight.AircraftID = request.AircraftID
	flight.DestinationAirportID = request.DestinationAirportID
	flight.OriginAirportID = request.OriginAirportID
	flight.DepartureTime = request.DepartureTime
	flight.ArrivalTime = request.ArrivalTime
	flight.Status = domain2.FlightStatus(request.Status)

	return s.flightRepository.UpdateFlight(ctx, flight)

}

func (s *FlightService) DeleteFlight(ctx context.Context, id string) error {
	return s.flightRepository.DeleteFlight(ctx, id)
}

func (s *FlightService) SearchFlights(
	ctx context.Context,
	request *dto2.FlightSearchRequest,
) ([]*dto2.FlightSearchResponse, error) {
	if err := validation.ValidateFlightSearchRequest(request); err != nil {
		return nil, err
	}

	departureAirport, err := s.airportRepository.GetByCode(
		ctx,
		request.DepartureAirportCode,
	)
	if err != nil {
		return nil, err
	}

	if departureAirport == nil {
		return nil, errs.ErrAirportNotFound
	}

	arrivalAirport, err := s.airportRepository.GetByCode(
		ctx,
		request.ArrivalAirportCode,
	)

	if err != nil {
		return nil, err
	}

	if arrivalAirport == nil {
		return nil, errs.ErrAirportNotFound
	}

	if departureAirport.ID == arrivalAirport.ID {
		return nil, errs.ErrDepartureAndArrivalSame
	}

	results, err := s.flightRepository.SearchFlights(
		ctx,
		departureAirport.ID,
		arrivalAirport.ID,
		request.DepartureDate,
		request.Passengers,
		request.OrderBy,
		request.CabinClass,
	)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto2.FlightSearchResponse, len(results))

	for i, flight := range results {
		duration := int(
			flight.ArrivalTime.Sub(flight.DepartureTime).Minutes(),
		)

		responses[i] = &dto2.FlightSearchResponse{
			FlightID:             flight.ID,
			FlightNumber:         flight.FlightNumber,
			DepartureTime:        flight.DepartureTime,
			ArrivalTime:          flight.ArrivalTime,
			Status:               flight.Status,
			AvailableSeats:       flight.AvailableSeats,
			LowestPrice:          flight.LowestPrice,
			DepartureAirportCode: departureAirport.Code,
			ArrivalAirportCode:   arrivalAirport.Code,
			DurationMinutes:      duration,
		}
	}
	return responses, nil
}
