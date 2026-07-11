package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/validation"
)

type PassengerService struct {
	passengerRepo   repository.PassengerRepository
	reservationRepo repository.ReservationRepository
}

func NewPassengerService(passengerRepo repository.PassengerRepository, reservationRepo repository.ReservationRepository) *PassengerService {
	return &PassengerService{
		passengerRepo:   passengerRepo,
		reservationRepo: reservationRepo,
	}
}

func (s *PassengerService) CreatePassenger(ctx context.Context, reservationID string, req *dto.CreatePassengerRequest) (*dto.PassengerResponse, error) {
	if err := validation.ValidateCreatePassengerRequest(req); err != nil {
		return nil, err
	}

	reservation, err := s.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}
	if reservation == nil {
		return nil, errs.ErrReservationNotFound
	}

	now := time.Now().UTC()
	passenger := &domain.Passenger{
		ID:                  uuid.NewString(),
		ReservationID:       reservationID,
		FirstName:           req.FirstName,
		LastName:            req.LastName,
		Gender:              req.Gender,
		DateOfBirth:         req.DateOfBirth,
		Nationality:         req.Nationality,
		Email:               req.Email,
		Phone:               req.Phone,
		PassportNumber:      req.PassportNumber,
		PassportExpiry:      req.PassportExpiry,
		PassportCountry:     req.PassportCountry,
		MealPreference:      req.MealPreference,
		SpecialAssistance:   req.SpecialAssistance,
		FrequentFlyerNumber: req.FrequentFlyerNumber,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	if err := s.passengerRepo.CreatePassenger(ctx, passenger); err != nil {
		return nil, err
	}

	return s.mapToResponse(passenger), nil
}

func (s *PassengerService) GetPassengerByID(ctx context.Context, id string) (*dto.PassengerResponse, error) {
	if err := validation.ValidatePassengerID(id); err != nil {
		return nil, err
	}

	passenger, err := s.passengerRepo.GetPassengerByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if passenger == nil {
		return nil, errs.ErrPassengerNotFound
	}

	return s.mapToResponse(passenger), nil
}

func (s *PassengerService) GetPassengersByReservationID(ctx context.Context, reservationID string) ([]*dto.PassengerResponse, error) {
	if err := validation.ValidateReservationID(reservationID); err != nil {
		return nil, err
	}

	passengers, err := s.passengerRepo.GetPassengersByReservationID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	var responses []*dto.PassengerResponse
	for _, p := range passengers {
		responses = append(responses, s.mapToResponse(p))
	}

	if responses == nil {
		responses = make([]*dto.PassengerResponse, 0)
	}

	return responses, nil
}

func (s *PassengerService) UpdatePassenger(ctx context.Context, id string, req *dto.UpdatePassengerRequest) (*dto.PassengerResponse, error) {
	if err := validation.ValidatePassengerID(id); err != nil {
		return nil, err
	}

	if err := validation.ValidateUpdatePassengerRequest(req); err != nil {
		return nil, err
	}

	passenger, err := s.passengerRepo.GetPassengerByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if passenger == nil {
		return nil, errs.ErrPassengerNotFound
	}

	passenger.FirstName = req.FirstName
	passenger.LastName = req.LastName
	passenger.Gender = req.Gender
	passenger.DateOfBirth = req.DateOfBirth
	passenger.Nationality = req.Nationality
	passenger.Email = req.Email
	passenger.Phone = req.Phone
	passenger.PassportNumber = req.PassportNumber
	passenger.PassportExpiry = req.PassportExpiry
	passenger.PassportCountry = req.PassportCountry
	passenger.MealPreference = req.MealPreference
	passenger.SpecialAssistance = req.SpecialAssistance
	passenger.FrequentFlyerNumber = req.FrequentFlyerNumber
	passenger.UpdatedAt = time.Now().UTC()

	if err := s.passengerRepo.UpdatePassenger(ctx, passenger); err != nil {
		return nil, err
	}

	return s.mapToResponse(passenger), nil
}

func (s *PassengerService) DeletePassenger(ctx context.Context, id string) error {
	if err := validation.ValidatePassengerID(id); err != nil {
		return err
	}

	return s.passengerRepo.DeletePassenger(ctx, id)
}

func (s *PassengerService) mapToResponse(passenger *domain.Passenger) *dto.PassengerResponse {
	return &dto.PassengerResponse{
		ID:                  passenger.ID,
		ReservationID:       passenger.ReservationID,
		FirstName:           passenger.FirstName,
		LastName:            passenger.LastName,
		Gender:              passenger.Gender,
		DateOfBirth:         passenger.DateOfBirth,
		Nationality:         passenger.Nationality,
		Email:               passenger.Email,
		Phone:               passenger.Phone,
		PassportNumber:      passenger.PassportNumber,
		PassportExpiry:      passenger.PassportExpiry,
		PassportCountry:     passenger.PassportCountry,
		MealPreference:      passenger.MealPreference,
		SpecialAssistance:   passenger.SpecialAssistance,
		FrequentFlyerNumber: passenger.FrequentFlyerNumber,
		CreatedAt:           passenger.CreatedAt,
		UpdatedAt:           passenger.UpdatedAt,
	}
}
