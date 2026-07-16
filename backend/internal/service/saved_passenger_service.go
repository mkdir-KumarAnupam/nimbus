package service

import (
	"context"
	"time"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
)

type SavedPassengerService struct {
	repo repository.SavedPassengerRepository
}

func NewSavedPassengerService(repo repository.SavedPassengerRepository) *SavedPassengerService {
	return &SavedPassengerService{
		repo: repo,
	}
}

func (s *SavedPassengerService) CreateSavedPassenger(ctx context.Context, userID string, req dto.SavedPassengerRequest) (*dto.SavedPassengerResponse, error) {
	dob, err := time.Parse(time.RFC3339, req.DateOfBirth)
	if err != nil {
		return nil, err
	}

	var passportExpiry *time.Time
	if req.PassportExpiry != nil {
		exp, err := time.Parse(time.RFC3339, *req.PassportExpiry)
		if err == nil {
			passportExpiry = &exp
		}
	}

	passenger := &domain.SavedPassenger{
		UserID:              userID,
		FirstName:           req.FirstName,
		LastName:            req.LastName,
		Gender:              req.Gender,
		DateOfBirth:         dob,
		Nationality:         req.Nationality,
		Email:               req.Email,
		Phone:               req.Phone,
		PassportNumber:      req.PassportNumber,
		PassportExpiry:      passportExpiry,
		PassportCountry:     req.PassportCountry,
		MealPreference:      req.MealPreference,
		SpecialAssistance:   req.SpecialAssistance,
		FrequentFlyerNumber: req.FrequentFlyerNumber,
	}

	if err := s.repo.Create(ctx, passenger); err != nil {
		return nil, err
	}

	return s.mapToResponse(passenger), nil
}

func (s *SavedPassengerService) GetSavedPassengersByUserID(ctx context.Context, userID string) ([]dto.SavedPassengerResponse, error) {
	passengers, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var res []dto.SavedPassengerResponse
	for _, p := range passengers {
		res = append(res, *s.mapToResponse(&p))
	}

	if res == nil {
		res = make([]dto.SavedPassengerResponse, 0)
	}
	return res, nil
}

func (s *SavedPassengerService) UpdateSavedPassenger(ctx context.Context, id string, userID string, req dto.SavedPassengerRequest) (*dto.SavedPassengerResponse, error) {
	passenger, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if passenger.UserID != userID {
		return nil, err
	}

	dob, err := time.Parse(time.RFC3339, req.DateOfBirth)
	if err != nil {
		return nil, err
	}

	var passportExpiry *time.Time
	if req.PassportExpiry != nil {
		exp, err := time.Parse(time.RFC3339, *req.PassportExpiry)
		if err == nil {
			passportExpiry = &exp
		}
	}

	passenger.FirstName = req.FirstName
	passenger.LastName = req.LastName
	passenger.Gender = req.Gender
	passenger.DateOfBirth = dob
	passenger.Nationality = req.Nationality
	passenger.Email = req.Email
	passenger.Phone = req.Phone
	passenger.PassportNumber = req.PassportNumber
	passenger.PassportExpiry = passportExpiry
	passenger.PassportCountry = req.PassportCountry
	passenger.MealPreference = req.MealPreference
	passenger.SpecialAssistance = req.SpecialAssistance
	passenger.FrequentFlyerNumber = req.FrequentFlyerNumber

	if err := s.repo.Update(ctx, passenger); err != nil {
		return nil, err
	}

	return s.mapToResponse(passenger), nil
}

func (s *SavedPassengerService) DeleteSavedPassenger(ctx context.Context, id string, userID string) error {
	passenger, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if passenger.UserID != userID {
		return err
	}

	return s.repo.Delete(ctx, id)
}

func (s *SavedPassengerService) mapToResponse(p *domain.SavedPassenger) *dto.SavedPassengerResponse {
	return &dto.SavedPassengerResponse{
		ID:                  p.ID,
		UserID:              p.UserID,
		FirstName:           p.FirstName,
		LastName:            p.LastName,
		Gender:              p.Gender,
		DateOfBirth:         p.DateOfBirth,
		Nationality:         p.Nationality,
		Email:               p.Email,
		Phone:               p.Phone,
		PassportNumber:      p.PassportNumber,
		PassportExpiry:      p.PassportExpiry,
		PassportCountry:     p.PassportCountry,
		MealPreference:      p.MealPreference,
		SpecialAssistance:   p.SpecialAssistance,
		FrequentFlyerNumber: p.FrequentFlyerNumber,
		CreatedAt:           p.CreatedAt,
		UpdatedAt:           p.UpdatedAt,
	}
}
