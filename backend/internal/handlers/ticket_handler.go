package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/service"
)

type TicketHandler struct {
	ticketService *service.TicketService
}

func NewTicketHandler(ticketService *service.TicketService) *TicketHandler {
	return &TicketHandler{
		ticketService: ticketService,
	}
}

func (h *TicketHandler) GetTicketByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	ticket, err := h.ticketService.GetTicketByID(r.Context(), id)
	if err != nil {
		writeTicketError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
}

func (h *TicketHandler) GetTicketByReservationID(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("reservationId")

	ticket, err := h.ticketService.GetTicketByReservationID(
		r.Context(),
		reservationID,
	)
	if err != nil {
		writeTicketError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
}

func (h *TicketHandler) GetTicketByTicketNumber(w http.ResponseWriter, r *http.Request) {
	ticketNumber := r.PathValue("ticketNumber")

	ticket, err := h.ticketService.GetTicketByTicketNumber(
		r.Context(),
		ticketNumber,
	)
	if err != nil {
		writeTicketError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
}

func (h *TicketHandler) GetTicketsByUserID(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")

	tickets, err := h.ticketService.GetTicketsByUserID(
		r.Context(),
		userID,
	)
	if err != nil {
		writeTicketError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func (h *TicketHandler) ListTickets(w http.ResponseWriter, r *http.Request) {
	tickets, err := h.ticketService.ListTickets(r.Context())
	if err != nil {
		writeTicketError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func writeTicketError(w http.ResponseWriter, err error) {
	switch err {

	case errs.ErrTicketNotFound:
		http.Error(w, err.Error(), http.StatusNotFound)

	case errs.ErrUserNotFound:
		http.Error(w, err.Error(), http.StatusNotFound)

	case errs.ErrDuplicateTicket,
		errs.ErrUnableToGenerateUniqueTicketNumber,
		errs.ErrTicketAlreadyExists:
		http.Error(w, err.Error(), http.StatusConflict)

	default:
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}
