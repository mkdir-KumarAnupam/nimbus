package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/response"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/service"
)

type SeatHandler struct {
	seatService *service.SeatService
}

func NewSeatHandler(seatService *service.SeatService) *SeatHandler {
	return &SeatHandler{seatService: seatService}
}

func (h *SeatHandler) GetSeatByID(w http.ResponseWriter, r *http.Request) {
	seatID := r.PathValue("id")

	seat, err := h.seatService.GetSeatByID(r.Context(), seatID)
	if err != nil {
		if errors.Is(err, errs.ErrSeatNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, seat)
}

func (h *SeatHandler) GetSeatsByAircraftID(w http.ResponseWriter, r *http.Request) {
	aircraftID := r.PathValue("aircraftId")

	seats, err := h.seatService.GetSeatsByAircraftID(r.Context(), aircraftID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, seats)
}

func (h *SeatHandler) CreateSeat(w http.ResponseWriter, r *http.Request) {
	req := &dto.CreateSeatRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.seatService.Create(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrSeatAlreadyExists):
			response.Error(w, http.StatusConflict, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusCreated, map[string]string{
		"message": "seat created",
	})
}

func (h *SeatHandler) UpdateSeatByID(w http.ResponseWriter, r *http.Request) {
	seatID := r.PathValue("id")

	req := &dto.UpdateSeatRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.seatService.UpdateSeat(r.Context(), seatID, req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrSeatNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "seat updated",
	})
}

func (h *SeatHandler) DeleteSeatByID(w http.ResponseWriter, r *http.Request) {
	seatID := r.PathValue("id")
	err := h.seatService.DeleteSeat(r.Context(), seatID)

	if err != nil {
		switch {
		case errors.Is(err, errs.ErrSeatNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "seat deleted",
	})
}
