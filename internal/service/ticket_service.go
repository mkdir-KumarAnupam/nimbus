package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/validation"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/utils"
)

type TicketService struct {
	ticketRepository repository.TicketRepository
}

func NewTicketService(
	ticketRepository repository.TicketRepository,
) *TicketService {
	return &TicketService{
		ticketRepository: ticketRepository,
	}
}

func (s *TicketService) IssueTicket(
	ctx context.Context,
	ticketRepo repository.TicketRepository,
	reservation *domain.Reservation,
	departureTime time.Time,
) (*domain.Ticket, error) {

	const maxTicketNumberRetries = 10

	// Idempotency: don't create another ticket if one already exists.
	existingTicket, err := ticketRepo.GetTicketByReservationID(
		ctx,
		reservation.ID,
	)
	if err != nil {
		return nil, err
	}

	if existingTicket != nil {
		return existingTicket, nil
	}

	ticket := &domain.Ticket{
		ReservationID: reservation.ID,
		UserID:        reservation.UserID,
		FlightID:      reservation.FlightID,
		Status:        domain.TicketIssued,
	}

	for i := 0; i < maxTicketNumberRetries; i++ {
		ticketNumber, err := utils.GenerateTicketNumber(departureTime)
		if err != nil {
			return nil, err
		}

		now := time.Now().UTC()

		ticket.ID = uuid.NewString()
		ticket.TicketNumber = ticketNumber
		ticket.IssuedAt = now
		ticket.CreatedAt = now
		ticket.UpdatedAt = now

		err = ticketRepo.CreateTicket(ctx, ticket)
		if err == nil {
			return ticket, nil
		}

		if errors.Is(err, errs.ErrDuplicateTicket) {
			continue
		}

		return nil, err
	}

	return nil, errs.ErrUnableToGenerateUniqueTicketNumber
}

func (s *TicketService) GetTicketByID(
	ctx context.Context,
	id string,
) (*dto.TicketResponse, error) {

	if err := validation.ValidateTicketID(id); err != nil {
		return nil, err
	}

	ticket, err := s.ticketRepository.GetTicketByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if ticket == nil {
		return nil, errs.ErrTicketNotFound
	}

	return ticketToResponse(ticket), nil
}

func (s *TicketService) GetTicketByReservationID(
	ctx context.Context,
	reservationID string,
) (*dto.TicketResponse, error) {

	if err := validation.ValidateReservationID(reservationID); err != nil {
		return nil, err
	}

	ticket, err := s.ticketRepository.GetTicketByReservationID(
		ctx,
		reservationID,
	)
	if err != nil {
		return nil, err
	}

	if ticket == nil {
		return nil, errs.ErrTicketNotFound
	}

	return ticketToResponse(ticket), nil
}

func (s *TicketService) GetTicketsByUserID(
	ctx context.Context,
	userID string,
) ([]*dto.TicketResponse, error) {

	if err := validation.ValidateReservationUserID(userID); err != nil {
		return nil, err
	}

	tickets, err := s.ticketRepository.GetTicketsByUserID(
		ctx,
		userID,
	)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.TicketResponse, len(tickets))
	for i, ticket := range tickets {
		responses[i] = ticketToResponse(ticket)
	}

	return responses, nil
}

func (s *TicketService) ListTickets(
	ctx context.Context,
) ([]*dto.TicketResponse, error) {

	tickets, err := s.ticketRepository.ListTickets(ctx)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.TicketResponse, len(tickets))

	for i, ticket := range tickets {
		responses[i] = ticketToResponse(ticket)
	}

	return responses, nil
}

func (s *TicketService) GetTicketByTicketNumber(
	ctx context.Context,
	ticketNumber string,
) (*dto.TicketResponse, error) {

	if err := validation.ValidateTicketNumber(ticketNumber); err != nil {
		return nil, err
	}

	ticket, err := s.ticketRepository.GetTicketByTicketNumber(
		ctx,
		ticketNumber,
	)
	if err != nil {
		return nil, err
	}

	if ticket == nil {
		return nil, errs.ErrTicketNotFound
	}

	return ticketToResponse(ticket), nil
}
