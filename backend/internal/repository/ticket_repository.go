package repository

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
)

type TicketRepository interface {
	CreateTicket(
		ctx context.Context,
		ticket *domain.Ticket,
	) error

	GetTicketByID(
		ctx context.Context,
		id string,
	) (*domain.Ticket, error)

	GetTicketByReservationID(
		ctx context.Context,
		reservationID string,
	) (*domain.Ticket, error)

	GetTicketByTicketNumber(
		ctx context.Context,
		ticketNumber string,
	) (*domain.Ticket, error)

	GetTicketsByUserID(
		ctx context.Context,
		userID string,
	) ([]*domain.Ticket, error)

	ListTickets(
		ctx context.Context,
	) ([]*domain.Ticket, error)

	UpdateTicket(
		ctx context.Context,
		ticket *domain.Ticket,
	) error
}
