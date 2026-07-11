package service

import (
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
)

func ticketToResponse(ticket *domain.Ticket) *dto.TicketResponse {
	if ticket == nil {
		return nil
	}

	return &dto.TicketResponse{
		ID:            ticket.ID,
		TicketNumber:  ticket.TicketNumber,
		UserID:        ticket.UserID,
		FlightID:      ticket.FlightID,
		ReservationID: ticket.ReservationID,
		Status:        string(ticket.Status),
		IssuedAt:      ticket.IssuedAt,
		CreatedAt:     ticket.CreatedAt,
		UpdatedAt:     ticket.UpdatedAt,
	}
}
