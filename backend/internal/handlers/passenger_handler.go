package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/response"
)

type PassengerHandler struct {
	passengerService *service.PassengerService
}

func NewPassengerHandler(passengerService *service.PassengerService) *PassengerHandler {
	return &PassengerHandler{
		passengerService: passengerService,
	}
}

func (h *PassengerHandler) CreatePassenger(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("reservationId")

	var req dto.CreatePassengerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	passenger, err := h.passengerService.CreatePassenger(r.Context(), reservationID, &req)
	if err != nil {
		writePassengerError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, passenger)
}

func (h *PassengerHandler) GetPassengerByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	passenger, err := h.passengerService.GetPassengerByID(r.Context(), id)
	if err != nil {
		writePassengerError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, passenger)
}

func (h *PassengerHandler) GetPassengersByReservationID(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("reservationId")

	passengers, err := h.passengerService.GetPassengersByReservationID(r.Context(), reservationID)
	if err != nil {
		writePassengerError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, passengers)
}

func (h *PassengerHandler) UpdatePassenger(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req dto.UpdatePassengerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	passenger, err := h.passengerService.UpdatePassenger(r.Context(), id, &req)
	if err != nil {
		writePassengerError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, passenger)
}

func (h *PassengerHandler) DeletePassenger(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	if err := h.passengerService.DeletePassenger(r.Context(), id); err != nil {
		writePassengerError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func writePassengerError(w http.ResponseWriter, err error) {
	switch err {
	case errs.ErrPassengerNotFound, errs.ErrReservationNotFound:
		response.Error(w, http.StatusNotFound, err.Error())
	default:
		response.Error(w, http.StatusBadRequest, err.Error())
	}
}
