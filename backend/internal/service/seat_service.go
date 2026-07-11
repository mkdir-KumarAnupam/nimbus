package service

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/validation"
)

type SeatService struct {
	seatRepository repository.SeatRepository
}

func NewSeatService(seatRepository repository.SeatRepository) *SeatService {
	return &SeatService{seatRepository: seatRepository}
}

func (s *SeatService) Create(ctx context.Context, req *dto.CreateSeatRequest) error {
	req.SeatNumber = strings.ToUpper(strings.TrimSpace(req.SeatNumber))
	req.AircraftID = strings.TrimSpace(req.AircraftID)
	req.Class = strings.ToLower(strings.TrimSpace(req.Class))

	if err := validation.ValidateSeatAircraftID(req.AircraftID); err != nil {
		return err
	}

	if err := validation.ValidateSeatNumber(req.SeatNumber); err != nil {
		return err
	}

	if err := validation.ValidateSeatClass(req.Class); err != nil {
		return err
	}

	// TODO: Check if seat already exists for aircraft
	existingSeat, err := s.seatRepository.GetByAircraftIDAndSeatNumber(ctx, req.AircraftID, req.SeatNumber)
	if err != nil {
		return err
	}

	if existingSeat != nil {
		return errs.ErrSeatAlreadyExists
	}

	seat := &domain.Seat{
		ID:         uuid.NewString(),
		AircraftID: req.AircraftID,
		SeatNumber: req.SeatNumber,
		Class:      domain.SeatClass(req.Class),
	}

	return s.seatRepository.CreateSeat(ctx, seat)
}

func (s *SeatService) GetSeatByID(ctx context.Context, seatID string) (*dto.SeatResponse, error) {
	seat, err := s.seatRepository.GetByID(ctx, seatID)

	if err != nil {
		return nil, err
	}

	if seat == nil {
		return nil, errs.ErrSeatNotFound
	}

	return seatToResponse(seat), nil
}

func (s *SeatService) GetSeatsByAircraftID(ctx context.Context, aircraftID string) ([]*dto.SeatResponse, error) {
	seats, err := s.seatRepository.GetByAircraftID(ctx, aircraftID)

	if err != nil {
		return nil, err
	}

	responses := make([]*dto.SeatResponse, len(seats))

	for i, seat := range seats {
		responses[i] = seatToResponse(seat)
	}

	return responses, nil
}

func (s *SeatService) UpdateSeat(ctx context.Context, seatID string, req *dto.UpdateSeatRequest) error {
	seat, err := s.seatRepository.GetByID(ctx, seatID)
	if err != nil {
		return err
	}

	if seat == nil {
		return errs.ErrSeatNotFound
	}

	req.Class = strings.ToLower(strings.TrimSpace(req.Class))

	if err := validation.ValidateSeatClass(req.Class); err != nil {
		return err
	}

	seat.Class = domain.SeatClass(req.Class)

	return s.seatRepository.UpdateSeat(ctx, seat)
}

func (s *SeatService) DeleteSeat(ctx context.Context, seatID string) error {
	return s.seatRepository.DeleteSeat(ctx, seatID)
}

func seatToResponse(seat *domain.Seat) *dto.SeatResponse {
	return &dto.SeatResponse{
		ID:         seat.ID,
		AircraftID: seat.AircraftID,
		SeatNumber: seat.SeatNumber,
		Class:      string(seat.Class),
	}
}
