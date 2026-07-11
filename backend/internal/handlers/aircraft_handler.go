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

type AircraftHandler struct {
	aircraftService *service.AircraftService
}

func NewAircraftHandler(aircraftService *service.AircraftService) *AircraftHandler {
	return &AircraftHandler{aircraftService: aircraftService}
}

func (h *AircraftHandler) GetAircraftByRegistration(w http.ResponseWriter, r *http.Request) {
	registration := r.PathValue("registration")

	aircraft, err := h.aircraftService.GetAircraftByRegistration(r.Context(), registration)
	if err != nil {
		if errors.Is(err, errs.ErrAircraftNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, aircraft)
}

func (h *AircraftHandler) GetAircraftByID(w http.ResponseWriter, r *http.Request) {
	aircraftID := r.PathValue("id")

	aircraft, err := h.aircraftService.GetAircraftByID(r.Context(), aircraftID)
	if err != nil {
		if errors.Is(err, errs.ErrAircraftNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, aircraft)
}

func (h *AircraftHandler) CreateAircraft(w http.ResponseWriter, r *http.Request) {
	req := &dto.CreateAircraftRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.aircraftService.Create(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAircraftAlreadyExists):
			response.Error(w, http.StatusConflict, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusCreated, map[string]string{
		"message": "aircraft created",
	})
}

func (h *AircraftHandler) UpdateAircraftByID(w http.ResponseWriter, r *http.Request) {
	aircraftID := r.PathValue("id")

	req := &dto.UpdateAircraftRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.aircraftService.UpdateAircraft(r.Context(), aircraftID, req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAircraftNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "aircraft updated",
	})
}

func (h *AircraftHandler) DeleteAircraftByID(w http.ResponseWriter, r *http.Request) {
	aircraftID := r.PathValue("id")
	err := h.aircraftService.DeleteAircraft(r.Context(), aircraftID)

	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAircraftNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "aircraft deleted",
	})
}
