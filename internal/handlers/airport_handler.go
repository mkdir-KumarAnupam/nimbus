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

type AirportHandler struct {
	airportService *service.AirportService
}

func NewAirportHandler(airportService *service.AirportService) *AirportHandler {
	return &AirportHandler{airportService: airportService}
}

func (h *AirportHandler) GetAirportByCode(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	airport, err := h.airportService.GetAirportByCode(r.Context(), code)
	if err != nil {
		if errors.Is(err, errs.ErrAirportNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, airport)
}

func (h *AirportHandler) GetAirportByID(w http.ResponseWriter, r *http.Request) {
	airportID := r.PathValue("id")
	airport, err := h.airportService.GetAirportByID(r.Context(), airportID)
	if err != nil {
		if errors.Is(err, errs.ErrAirportNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}
	response.JSON(w, http.StatusOK, airport)
}

func (h *AirportHandler) CreateAirport(w http.ResponseWriter, r *http.Request) {
	req := &dto.CreateAirportRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.airportService.Create(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAirportAlreadyExists):
			response.Error(w, http.StatusConflict, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusCreated, map[string]string{
		"message": "airport created",
	})

}

func (h *AirportHandler) UpdateAirportByID(w http.ResponseWriter, r *http.Request) {
	airportID := r.PathValue("id")

	req := &dto.UpdateAirportRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.airportService.UpdateAirport(r.Context(), airportID, req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAirportNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "airport updated",
	})

}

func (h *AirportHandler) DeleteAirportByID(w http.ResponseWriter, r *http.Request) {
	airportID := r.PathValue("id")
	err := h.airportService.DeleteAirport(r.Context(), airportID)

	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAirportNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "airport deleted",
	})
}
