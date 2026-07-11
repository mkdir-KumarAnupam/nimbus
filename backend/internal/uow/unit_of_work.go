package uow

import (
	"context"

	repository2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
)

type Repositories struct {
	Reservation repository2.ReservationRepository
	FlightSeat  repository2.FlightSeatRepository
	Ticket      repository2.TicketRepository
	Flight      repository2.FlightRepository
}

type UnitOfWork interface {
	Do(ctx context.Context, fn func(Repositories) error) error
}
