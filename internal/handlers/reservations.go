package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
)

type ReservationHandler struct {
	reservationService *service.ReservationService
}

func NewReservationHandler(reservationService *service.ReservationService) *ReservationHandler {
	return &ReservationHandler{
		reservationService: reservationService,
	}
}

func (h *ReservationHandler) ReserveSeat(w http.ResponseWriter, r *http.Request) {
	var req dto.ReserveSeatRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.reservationService.ReserveSeat(r.Context(), &req); err != nil {
		writeReservationError(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *ReservationHandler) ConfirmReservation(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("id")

	if err := h.reservationService.ConfirmReservation(r.Context(), reservationID); err != nil {
		writeReservationError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ReservationHandler) GetReservationByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	reservation, err := h.reservationService.GetReservationByID(r.Context(), id)
	if err != nil {
		writeReservationError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservation)
}

func (h *ReservationHandler) GetReservationsByUserID(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")

	reservations, err := h.reservationService.GetReservationByUserID(r.Context(), userID)
	if err != nil {
		writeReservationError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservations)
}

func (h *ReservationHandler) GetReservationsByFlightID(w http.ResponseWriter, r *http.Request) {
	flightID := r.PathValue("flightId")

	reservations, err := h.reservationService.GetReservationByFlightID(r.Context(), flightID)
	if err != nil {
		writeReservationError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservations)
}

func (h *ReservationHandler) ListReservations(w http.ResponseWriter, r *http.Request) {
	reservations, err := h.reservationService.ListReservations(r.Context())
	if err != nil {
		writeReservationError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservations)
}

func (h *ReservationHandler) CancelReservation(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("id")
	userID := r.PathValue("userId")

	if err := h.reservationService.CancelReservation(r.Context(), reservationID, userID); err != nil {
		writeReservationError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func writeReservationError(w http.ResponseWriter, err error) {
	switch err {

	case errs.ErrReservationNotFound:
		http.Error(w, err.Error(), http.StatusNotFound)

	case errs.ErrUserNotFound,
		errs.ErrFlightNotFound,
		errs.ErrFlightSeatNotFound:
		http.Error(w, err.Error(), http.StatusNotFound)

	case errs.ErrReservationAlreadyBooked,
		errs.ErrReservationCannotBeCancelled,
		errs.ErrUserReservationMismatch,
		errs.ErrFlightSeatNotAvailable,
		errs.ErrFlightStatusInvalid,
		errs.ErrInvalidTransactionState,
		errs.ErrReservationCannotBeMade:
		http.Error(w, err.Error(), http.StatusConflict)

	default:
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}
