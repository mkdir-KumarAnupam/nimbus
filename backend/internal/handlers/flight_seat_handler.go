package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/response"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
)

type FlightSeatHandler struct {
	flightSeatService *service.FlightSeatService
}

func NewFlightSeatHandler(flightSeatService *service.FlightSeatService) *FlightSeatHandler {
	return &FlightSeatHandler{flightSeatService: flightSeatService}
}

func (h *FlightSeatHandler) GenerateFlightInventory(w http.ResponseWriter, r *http.Request) {
	flightID := r.PathValue("flightId")

	if err := h.flightSeatService.GenerateFlightInventory(r.Context(), flightID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *FlightSeatHandler) GetFlightSeatByID(w http.ResponseWriter, r *http.Request) {
	flightSeatID := r.PathValue("id")

	flightSeat, err := h.flightSeatService.GetFlightSeatByID(r.Context(), flightSeatID)
	if err != nil {
		if errors.Is(err, errs.ErrFlightSeatNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, flightSeat)
}

func (h *FlightSeatHandler) GetFlightSeatsByFlightID(w http.ResponseWriter, r *http.Request) {
	flightID := r.PathValue("flightId")

	flightSeats, err := h.flightSeatService.GetFlightSeatsByFlightID(r.Context(), flightID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, flightSeats)
}

func (h *FlightSeatHandler) CreateFlightSeat(w http.ResponseWriter, r *http.Request) {
	req := &dto.CreateFlightSeatRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.flightSeatService.Create(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrFlightSeatAlreadyExists):
			response.Error(w, http.StatusConflict, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusCreated, map[string]string{
		"message": "flight seat created",
	})
}

func (h *FlightSeatHandler) UpdateFlightSeatByID(w http.ResponseWriter, r *http.Request) {
	flightSeatID := r.PathValue("id")

	req := &dto.UpdateFlightSeatRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.flightSeatService.UpdateFlightSeat(r.Context(), flightSeatID, req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrFlightSeatNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "flight seat updated",
	})
}

func (h *FlightSeatHandler) DeleteFlightSeatByID(w http.ResponseWriter, r *http.Request) {
	flightSeatID := r.PathValue("id")
	err := h.flightSeatService.DeleteFlightSeat(r.Context(), flightSeatID)

	if err != nil {
		switch {
		case errors.Is(err, errs.ErrFlightSeatNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "flight seat deleted",
	})
}
