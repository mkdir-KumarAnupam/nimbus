package service

import (
	"context"
	"strings"

	"github.com/google/uuid"
	domain2 "github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	repository2 "github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	validation2 "github.com/mkdir-KumarAnupam/airline-booking/internal/validation"
	"github.com/redis/go-redis/v9"
)

type FlightSeatService struct {
	flightSeatRepository repository2.FlightSeatRepository
	seatRepository       repository2.SeatRepository
	flightRepository     repository2.FlightRepository

	redis *redis.Client
}

func NewFlightSeatService(
	flightSeatRepo repository2.FlightSeatRepository,
	seatRepo repository2.SeatRepository,
	flightRepo repository2.FlightRepository,
	redis *redis.Client,
) *FlightSeatService {
	return &FlightSeatService{
		flightSeatRepository: flightSeatRepo,
		seatRepository:       seatRepo,
		flightRepository:     flightRepo,
		redis:                redis,
	}
}

func defaultSeatPrice(class domain2.SeatClass) int64 {
	switch class {
	case domain2.SeatFirst:
		return 2500000
	case domain2.SeatBusiness:
		return 1200000
	case domain2.SeatPremiumEconomy:
		return 800000
	case domain2.SeatEconomy:
		return 500000
	default:
		return 500000
	}
}

// Admin Purposes
func (s *FlightSeatService) Create(ctx context.Context, req *dto.CreateFlightSeatRequest) error {
	req.FlightID = strings.TrimSpace(req.FlightID)
	req.SeatID = strings.TrimSpace(req.SeatID)
	req.Status = strings.ToLower(strings.TrimSpace(req.Status))

	if err := validation2.ValidateFlightSeatFlightID(req.FlightID); err != nil {
		return err
	}

	if err := validation2.ValidateFlightSeatSeatID(req.SeatID); err != nil {
		return err
	}

	if err := validation2.ValidateFlightSeatStatus(req.Status); err != nil {
		return err
	}

	if err := validation2.ValidateFlightSeatPrice(req.Price); err != nil {
		return err
	}

	// TODO: Check if flight seat already exists
	existingFlightSeat, err := s.flightSeatRepository.GetByFlightIDAndSeatID(ctx, req.FlightID, req.SeatID)
	if err != nil {
		return err
	}

	if existingFlightSeat != nil {
		return errs.ErrFlightSeatAlreadyExists
	}

	flightSeat := &domain2.FlightSeat{
		ID:       uuid.NewString(),
		FlightID: req.FlightID,
		SeatID:   req.SeatID,
		Status:   domain2.SeatStatus(req.Status),
		Price:    req.Price,
	}

	return s.flightSeatRepository.CreateFlightSeat(ctx, flightSeat)
}

func (s *FlightSeatService) GetFlightSeatByID(ctx context.Context, flightSeatID string) (*dto.FlightSeatResponse, error) {
	flightSeat, err := s.flightSeatRepository.GetByID(ctx, flightSeatID)

	if err != nil {
		return nil, err
	}

	if flightSeat == nil {
		return nil, errs.ErrFlightSeatNotFound
	}

	return flightSeatToResponse(flightSeat), nil
}

func (s *FlightSeatService) GetFlightSeatsByFlightID(ctx context.Context, flightID string) ([]*dto.FlightSeatResponse, error) {
	flightSeats, err := s.flightSeatRepository.GetByFlightID(ctx, flightID)

	if err != nil {
		return nil, err
	}

	var responses []*dto.FlightSeatResponse
	for _, flightSeat := range flightSeats {
		responses = append(responses, flightSeatToResponse(flightSeat))
	}

	return responses, nil
}

func (s *FlightSeatService) UpdateFlightSeat(ctx context.Context, flightSeatID string, req *dto.UpdateFlightSeatRequest) error {
	flightSeat, err := s.flightSeatRepository.GetByID(ctx, flightSeatID)
	if err != nil {
		return err
	}

	if flightSeat == nil {
		return errs.ErrFlightSeatNotFound
	}

	req.Status = strings.ToLower(strings.TrimSpace(req.Status))

	if err := validation2.ValidateFlightSeatStatus(req.Status); err != nil {
		return err
	}

	if err := validation2.ValidateFlightSeatPrice(req.Price); err != nil {
		return err
	}

	flightSeat.Status = domain2.SeatStatus(req.Status)
	flightSeat.Price = req.Price

	return s.flightSeatRepository.UpdateFlightSeat(ctx, flightSeat)
}

func (s *FlightSeatService) DeleteFlightSeat(ctx context.Context, flightSeatID string) error {
	err := s.flightSeatRepository.DeleteFlightSeat(ctx, flightSeatID)
	if err != nil {
		return err
	}

	return nil
}

func flightSeatToResponse(
	flightSeat *domain2.FlightSeat,
) *dto.FlightSeatResponse {

	return &dto.FlightSeatResponse{
		ID:         flightSeat.ID,
		FlightID:   flightSeat.FlightID,
		SeatID:     flightSeat.SeatID,
		SeatNumber: flightSeat.Seat.SeatNumber,
		Class:      string(flightSeat.Seat.Class),
		Status:     string(flightSeat.Status),
		Price:      flightSeat.Price,
	}
}

func (s *FlightSeatService) GenerateFlightInventory(ctx context.Context, flightID string) error {
	// 1. Validate flight ID
	if err := validation2.ValidateFlightID(flightID); err != nil {
		return err
	}

	flight, err := s.flightRepository.GetByID(ctx, flightID)
	if err != nil {
		return err
	}

	if flight == nil {
		return errs.ErrFlightNotFound
	}

	if flight.Status != domain2.FlightScheduled {
		return errs.ErrFlightStatusInvalid
	}

	// 3. Check inventory doesn'layout already exist
	exists, err := s.flightSeatRepository.ExistsByFlightID(ctx, flightID)
	if err != nil {
		return err
	}

	if exists {
		return errs.ErrFlightInventoryExists
	}

	// 4. Load aircraft seats
	aircraftSeats, err := s.seatRepository.GetByAircraftID(ctx, flight.AircraftID)
	if err != nil {
		return err
	}

	if len(aircraftSeats) == 0 {
		return errs.ErrAircraftHasNoSeats
	}

	// 5. Build []FlightSeat
	flightSeats := make([]*domain2.FlightSeat, len(aircraftSeats))
	for i, aircraftSeat := range aircraftSeats {
		flightSeats[i] = &domain2.FlightSeat{
			ID:       uuid.NewString(),
			FlightID: flight.ID,
			SeatID:   aircraftSeat.ID,
			Status:   domain2.SeatAvailable,
			Price:    defaultSeatPrice(aircraftSeat.Class),
		}
	}

	// 6. Bulk insert
	return s.flightSeatRepository.CreateFlightSeats(ctx, flightSeats)
}
