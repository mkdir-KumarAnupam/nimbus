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

type AircraftService struct {
	aircraftRepository repository.AircraftRepository
}

func NewAircraftService(aircraftRepository repository.AircraftRepository) *AircraftService {
	return &AircraftService{aircraftRepository: aircraftRepository}
}

func (s *AircraftService) Create(ctx context.Context, req *dto.CreateAircraftRequest) error {
	req.Registration = strings.ToUpper(strings.TrimSpace(req.Registration))
	req.Model = strings.TrimSpace(req.Model)
	req.Status = strings.ToLower(strings.TrimSpace(req.Status))

	if err := validation.ValidateAircraftRegistration(req.Registration); err != nil {
		return err
	}

	if err := validation.ValidateAircraftModel(req.Model); err != nil {
		return err
	}

	if err := validation.ValidateAircraftTotalSeats(req.TotalSeats); err != nil {
		return err
	}

	if err := validation.ValidateAircraftStatus(req.Status); err != nil {
		return err
	}

	existingAircraft, err := s.aircraftRepository.GetByRegistration(ctx, req.Registration)
	if err != nil {
		return err
	}

	if existingAircraft != nil {
		return errs.ErrAircraftAlreadyExists
	}

	aircraft := &domain.Aircraft{
		ID:           uuid.NewString(),
		Registration: req.Registration,
		Model:        req.Model,
		TotalSeats:   req.TotalSeats,
		Status:       domain.AircraftStatus(req.Status),
	}

	return s.aircraftRepository.CreateAircraft(ctx, aircraft)
}

func (s *AircraftService) GetAircraftByRegistration(ctx context.Context, registration string) (*dto.AircraftResponse, error) {
	registration = strings.ToUpper(strings.TrimSpace(registration))

	aircraft, err := s.aircraftRepository.GetByRegistration(ctx, registration)
	if err != nil {
		return nil, err
	}

	if aircraft == nil {
		return nil, errs.ErrAircraftNotFound
	}

	return aircraftToResponse(aircraft), nil
}

func (s *AircraftService) GetAircraftByID(ctx context.Context, aircraftID string) (*dto.AircraftResponse, error) {
	aircraft, err := s.aircraftRepository.GetByID(ctx, aircraftID)

	if err != nil {
		return nil, err
	}

	if aircraft == nil {
		return nil, errs.ErrAircraftNotFound
	}

	return aircraftToResponse(aircraft), nil
}

func (s *AircraftService) UpdateAircraft(ctx context.Context, aircraftID string, req *dto.UpdateAircraftRequest) error {
	aircraft, err := s.aircraftRepository.GetByID(ctx, aircraftID)
	if err != nil {
		return err
	}

	if aircraft == nil {
		return errs.ErrAircraftNotFound
	}

	aircraft.Model = strings.TrimSpace(req.Model)
	aircraft.TotalSeats = req.TotalSeats
	aircraft.Status = domain.AircraftStatus(strings.ToLower(strings.TrimSpace(req.Status)))

	if err := validation.ValidateAircraftModel(aircraft.Model); err != nil {
		return err
	}

	if err := validation.ValidateAircraftTotalSeats(aircraft.TotalSeats); err != nil {
		return err
	}

	if err := validation.ValidateAircraftStatus(string(aircraft.Status)); err != nil {
		return err
	}

	return s.aircraftRepository.UpdateAircraft(ctx, aircraft)
}

func (s *AircraftService) DeleteAircraft(ctx context.Context, aircraftID string) error {
	err := s.aircraftRepository.DeleteAircraft(ctx, aircraftID)
	if err != nil {
		return err
	}

	return nil
}

func aircraftToResponse(aircraft *domain.Aircraft) *dto.AircraftResponse {
	return &dto.AircraftResponse{
		ID:           aircraft.ID,
		Registration: aircraft.Registration,
		Model:        aircraft.Model,
		TotalSeats:   aircraft.TotalSeats,
		Status:       string(aircraft.Status),
	}
}
