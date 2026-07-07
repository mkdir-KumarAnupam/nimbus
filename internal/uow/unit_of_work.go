package uow

import "context"
import "github.com/mkdir-KumarAnupam/airline-booking/internal/repository"

type Repositories struct {
	Reservation repository.ReservationRepository
	FlightSeat  repository.FlightSeatRepository
	Ticket      repository.TicketRepository
	Flight      repository.FlightRepository
}

type UnitOfWork interface {
	Do(ctx context.Context, fn func(Repositories) error) error
}
