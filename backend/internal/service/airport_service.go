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

type AirportService struct {
	airportRepository repository.AirportRepository
}

func NewAirportService(airportRepository repository.AirportRepository) *AirportService {
	return &AirportService{airportRepository: airportRepository}
}

func (s *AirportService) Create(ctx context.Context, req *dto.CreateAirportRequest) error {

	req.Code = strings.ToUpper(strings.TrimSpace(req.Code))
	req.Name = strings.TrimSpace(req.Name)
	req.City = strings.TrimSpace(req.City)
	req.Country = strings.TrimSpace(req.Country)
	req.Timezone = strings.TrimSpace(req.Timezone)

	if err := validation.ValidateAirportCode(req.Code); err != nil {
		return err
	}

	if err := validation.ValidateAirportName(req.Name); err != nil {
		return err
	}

	if err := validation.ValidateAirportCity(req.City); err != nil {
		return err
	}

	if err := validation.ValidateAirportCountry(req.Country); err != nil {
		return err
	}

	if err := validation.ValidateAirportTimezone(req.Timezone); err != nil {
		return err
	}

	existingAirport, err := s.airportRepository.GetByCode(ctx, req.Code)
	if err != nil {
		return err
	}

	if existingAirport != nil {
		return errs.ErrAirportAlreadyExists
	}

	airport := &domain.Airport{
		ID:       uuid.NewString(),
		Code:     req.Code,
		Name:     req.Name,
		City:     req.City,
		Country:  req.Country,
		Timezone: req.Timezone,
	}

	return s.airportRepository.CreateAirport(ctx, airport)
}

func (s *AirportService) GetAirportByCode(ctx context.Context, code string) (*dto.AirportResponse, error) {
	airport, err := s.airportRepository.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}

	if airport == nil {
		return nil, errs.ErrAirportNotFound
	}

	return airportToResponse(airport), nil
}

func (s *AirportService) GetAirportByID(ctx context.Context, airportID string) (*dto.AirportResponse, error) {
	airport, err := s.airportRepository.GetByID(ctx, airportID)

	if err != nil {
		return nil, err
	}

	if airport == nil {
		return nil, errs.ErrAirportNotFound
	}

	response := dto.AirportResponse{
		ID:       airport.ID,
		Code:     airport.Code,
		Name:     airport.Name,
		City:     airport.City,
		Country:  airport.Country,
		Timezone: airport.Timezone,
	}

	return &response, nil
}

func (s *AirportService) UpdateAirport(
	ctx context.Context,
	airportID string,
	req *dto.UpdateAirportRequest,
) error {

	// Fetch the existing airport
	airport, err := s.airportRepository.GetByID(ctx, airportID)
	if err != nil {
		return err
	}

	if airport == nil {
		return errs.ErrAirportNotFound
	}

	// Apply updates from the request
	airport.Name = strings.TrimSpace(req.Name)
	airport.City = strings.TrimSpace(req.City)
	airport.Country = strings.TrimSpace(req.Country)
	airport.Timezone = strings.TrimSpace(req.Timezone)

	if err := validation.ValidateAirportName(airport.Name); err != nil {
		return err
	}

	if err := validation.ValidateAirportCity(airport.City); err != nil {
		return err
	}

	if err := validation.ValidateAirportCountry(airport.Country); err != nil {
		return err
	}

	if err := validation.ValidateAirportTimezone(airport.Timezone); err != nil {
		return err
	}

	return s.airportRepository.UpdateAirport(ctx, airport)
}

func (s *AirportService) DeleteAirport(ctx context.Context, airportID string) error {
	err := s.airportRepository.DeleteAirport(ctx, airportID)
	if err != nil {
		return err
	}

	return nil
}

func airportToResponse(airport *domain.Airport) *dto.AirportResponse {
	return &dto.AirportResponse{
		ID:       airport.ID,
		Code:     airport.Code,
		Name:     airport.Name,
		City:     airport.City,
		Country:  airport.Country,
		Timezone: airport.Timezone,
	}
}

func (s *AirportService) ListAirports(
	ctx context.Context,
) ([]*domain.Airport, error) {

	return s.airportRepository.ListAirports(ctx)
}

func (s *AirportService) SearchAirports(
	ctx context.Context,
	query string,
	limit int,
) ([]*domain.Airport, error) {

	return s.airportRepository.SearchAirports(
		ctx,
		query,
		limit,
	)
}
