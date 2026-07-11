package service

import (
	"context"
	"time"

	domain2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	repository2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/uow"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/validation"
)

type BookingWorkflow interface {
	ConfirmBooking(ctx context.Context, reservationID string) error
	CancelBooking(ctx context.Context, reservationID string) error
}

type BookingWorkflowService struct {
	uow uow.UnitOfWork

	reservationRepository repository2.ReservationRepository
	flightSeatRepository  repository2.FlightSeatRepository
	flightRepository      repository2.FlightRepository

	reservationService *ReservationService
	ticketService      *TicketService
}

func NewBookingWorkflowService(
	uow uow.UnitOfWork,
	reservationRepository repository2.ReservationRepository,
	flightSeatRepository repository2.FlightSeatRepository,
	flightRepository repository2.FlightRepository,
	reservationService *ReservationService,
	ticketService *TicketService,
) *BookingWorkflowService {
	return &BookingWorkflowService{
		uow:                   uow,
		reservationRepository: reservationRepository,
		flightSeatRepository:  flightSeatRepository,
		flightRepository:      flightRepository,
		reservationService:    reservationService,
		ticketService:         ticketService,
	}
}

func (s *BookingWorkflowService) ConfirmBooking(
	ctx context.Context,
	reservationID string,
) error {

	if err := validation.ValidateReservationID(reservationID); err != nil {
		return err
	}

	reservation, err := s.reservationRepository.GetReservationByID(ctx, reservationID)
	if err != nil {
		return err
	}

	if reservation == nil {
		return errs.ErrReservationNotFound
	}

	now := time.Now().UTC()

	if !reservation.ExpiresAt.After(now) {

		return errs.ErrReservationExpired

	}

	if reservation.Status != domain2.ReservationPending {
		return errs.ErrInvalidTransactionState
	}

	seat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return err
	}

	if seat == nil {
		return errs.ErrFlightSeatNotFound
	}

	if seat.Status != domain2.SeatHeld {
		return errs.ErrReservationCannotBeMade
	}

	flight, err := s.flightRepository.GetByID(ctx, reservation.FlightID)
	if err != nil {
		return err
	}

	if flight == nil {
		return errs.ErrFlightNotFound
	}

	return s.uow.Do(ctx, func(repos uow.Repositories) error {

		if err := s.reservationService.confirmReservationTx(
			ctx,
			repos,
			reservation,
			seat,
		); err != nil {
			return err
		}

		_, err := s.ticketService.IssueTicket(
			ctx,
			repos.Ticket,
			reservation,
			flight.DepartureTime,
		)

		return err
	})
}

func (s *BookingWorkflowService) CancelBooking(
	ctx context.Context,
	reservationID string,
) error {

	if err := validation.ValidateReservationID(reservationID); err != nil {
		return err
	}

	reservation, err := s.reservationRepository.GetReservationByID(
		ctx,
		reservationID,
	)
	if err != nil {
		return err
	}

	if reservation == nil {
		return errs.ErrReservationNotFound
	}

	if reservation.Status != domain2.ReservationConfirmed {
		return errs.ErrReservationCannotBeCancelled
	}

	seat, err := s.flightSeatRepository.GetByID(
		ctx,
		reservation.FlightSeatID,
	)
	if err != nil {
		return err
	}

	if seat == nil {
		return errs.ErrFlightSeatNotFound
	}

	if seat.Status != domain2.SeatBooked {
		return errs.ErrInvalidTransactionState
	}

	return s.uow.Do(ctx, func(repos uow.Repositories) error {

		if err := s.reservationService.cancelReservationTx(
			ctx,
			repos,
			reservation,
			seat,
		); err != nil {
			return err
		}

		return s.ticketService.CancelTicket(
			ctx,
			repos.Ticket,
			reservation.ID,
		)
	})
}
