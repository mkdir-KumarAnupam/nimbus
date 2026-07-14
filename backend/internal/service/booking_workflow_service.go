package service

import (
	"context"
	"log"
	"time"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/email"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/uow"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/validation"
)

type BookingWorkflow interface {
	ConfirmBooking(ctx context.Context, reservationID string) error
	CancelBooking(ctx context.Context, reservationID string) error
}

type BookingWorkflowService struct {
	uow uow.UnitOfWork

	reservationRepository repository.ReservationRepository
	flightSeatRepository  repository.FlightSeatRepository
	flightRepository      repository.FlightRepository
	passengerRepository   repository.PassengerRepository
	airportRepository     repository.AirportRepository
	ticketRepository      repository.TicketRepository

	reservationService *ReservationService
	ticketService      *TicketService
	emailService       email.Service
}

func NewBookingWorkflowService(
	uow uow.UnitOfWork,
	reservationRepository repository.ReservationRepository,
	flightSeatRepository repository.FlightSeatRepository,
	flightRepository repository.FlightRepository,
	passengerRepository repository.PassengerRepository,
	airportRepository repository.AirportRepository,
	ticketRepository repository.TicketRepository,
	reservationService *ReservationService,
	ticketService *TicketService,
	emailService email.Service,

) *BookingWorkflowService {
	return &BookingWorkflowService{
		uow:                   uow,
		reservationRepository: reservationRepository,
		flightSeatRepository:  flightSeatRepository,
		passengerRepository:   passengerRepository,
		airportRepository:     airportRepository,
		ticketRepository:      ticketRepository,
		flightRepository:      flightRepository,
		reservationService:    reservationService,
		ticketService:         ticketService,
		emailService:          emailService,
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

	if reservation.Status != domain.ReservationPending {
		return errs.ErrInvalidTransactionState
	}

	seat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return err
	}

	if seat == nil {
		return errs.ErrFlightSeatNotFound
	}

	if seat.Status != domain.SeatHeld {
		return errs.ErrReservationCannotBeMade
	}

	flight, err := s.flightRepository.GetByID(ctx, reservation.FlightID)
	if err != nil {
		return err
	}

	if flight == nil {
		return errs.ErrFlightNotFound
	}

	var ticket *domain.Ticket

	err = s.uow.Do(ctx, func(repos uow.Repositories) error {

		if err := s.reservationService.confirmReservationTx(
			ctx,
			repos,
			reservation,
			seat,
		); err != nil {
			return err
		}

		ticket, err = s.ticketService.IssueTicket(
			ctx,
			repos.Ticket,
			reservation,
			flight.DepartureTime,
		)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err

	}

	emailData, err := s.buildBookingConfirmationEmail(
		ctx,
		reservation,
		ticket,
		flight,
		seat,
	)
	if err != nil {
		return err
	}
	if err := s.emailService.SendBookingConfirmation(ctx, *emailData); err != nil {
		log.Printf("failed to send booking confirmation email: %v", err)
	}

	return nil
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

	switch reservation.Status {

	case domain.ReservationConfirmed:
		// Continue with cancellation.

	case domain.ReservationCancelled:
		// Already cancelled.
		// This is fine (webhook retry).
		return nil

	default:
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

	if seat.Status != domain.SeatBooked {
		return errs.ErrInvalidTransactionState
	}

	flight, err := s.flightRepository.GetByID(
		ctx,
		reservation.FlightID,
	)
	if err != nil {
		return err
	}

	if flight == nil {
		return errs.ErrFlightNotFound
	}

	ticket, err := s.ticketRepository.GetTicketByReservationID(
		ctx,
		reservation.ID,
	)
	if err != nil {
		return err
	}

	if ticket == nil {
		return errs.ErrTicketNotFound
	}

	err = s.uow.Do(ctx, func(repos uow.Repositories) error {

		if err := s.reservationService.cancelReservationTx(
			ctx,
			repos,
			reservation,
			seat,
		); err != nil {
			return err
		}

		if err := s.ticketService.CancelTicket(
			ctx,
			repos.Ticket,
			reservation.ID,
		); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	emailData, err := s.buildBookingCancellationEmail(
		ctx,
		reservation,
		ticket,
		flight,
		seat,
	)
	if err != nil {
		return err
	}

	if err := s.emailService.SendBookingCancellation(
		ctx,
		*emailData,
	); err != nil {

		log.Printf(
			"failed to send cancellation email: %v",
			err,
		)
	}

	return nil
}

func (s *BookingWorkflowService) buildBookingConfirmationEmail(
	ctx context.Context,
	reservation *domain.Reservation,
	ticket *domain.Ticket,
	flight *domain.Flight,
	seat *domain.FlightSeat,
) (*email.BookingConfirmationData, error) {

	passenger, err := s.passengerRepository.GetPassengersByReservationID(
		ctx,
		reservation.ID,
	)
	if err != nil {
		return nil, err
	}

	if len(passenger) == 0 {
		return nil, errs.ErrPassengerNotFound
	}

	departureAirport, err := s.airportRepository.GetByID(
		ctx,
		flight.OriginAirportID,
	)
	if err != nil {
		return nil, err
	}

	arrivalAirport, err := s.airportRepository.GetByID(
		ctx,
		flight.DestinationAirportID,
	)
	if err != nil {
		return nil, err
	}

	primaryPassenger := passenger[0]

	return &email.BookingConfirmationData{
		ToEmail: primaryPassenger.Email,

		PassengerName: primaryPassenger.FirstName + " " + primaryPassenger.LastName,

		PNR: reservation.ReservationRef,

		FlightNumber: flight.FlightNumber,

		FromAirport: departureAirport.Code,
		ToAirport:   arrivalAirport.Code,

		DepartureTime: flight.DepartureTime.Format("02 Jan 2006, 15:04 MST"),
		ArrivalTime:   flight.ArrivalTime.Format("02 Jan 2006, 15:04 MST"),

		SeatNumber: seat.Seat.SeatNumber,

		TicketNumber: ticket.TicketNumber,
	}, nil
}

func (s *BookingWorkflowService) buildBookingCancellationEmail(
	ctx context.Context,
	reservation *domain.Reservation,
	ticket *domain.Ticket,
	flight *domain.Flight,
	seat *domain.FlightSeat,
) (*email.BookingCancellationData, error) {

	passenger, err := s.passengerRepository.GetPassengersByReservationID(
		ctx,
		reservation.ID,
	)
	if err != nil {
		return nil, err
	}

	if len(passenger) == 0 {
		return nil, errs.ErrPassengerNotFound
	}

	departureAirport, err := s.airportRepository.GetByID(
		ctx,
		flight.OriginAirportID,
	)
	if err != nil {
		return nil, err
	}

	arrivalAirport, err := s.airportRepository.GetByID(
		ctx,
		flight.DestinationAirportID,
	)
	if err != nil {
		return nil, err
	}

	primaryPassenger := passenger[0]

	return &email.BookingCancellationData{
		ToEmail: primaryPassenger.Email,

		PassengerName: primaryPassenger.FirstName + " " + primaryPassenger.LastName,

		PNR: reservation.ReservationRef,

		FlightNumber: flight.FlightNumber,

		FromAirport: departureAirport.Code,
		ToAirport:   arrivalAirport.Code,

		DepartureTime: flight.DepartureTime.Format("02 Jan 2006, 15:04 MST"),
		ArrivalTime:   flight.ArrivalTime.Format("02 Jan 2006, 15:04 MST"),

		SeatNumber: seat.Seat.SeatNumber,

		TicketNumber: ticket.TicketNumber,
	}, nil
}
