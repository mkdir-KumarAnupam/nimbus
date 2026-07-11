package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	dto2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/response"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/service"
)

type FlightHandler struct {
	flightService *service.FlightService
}

func NewFlightHandler(flightService *service.FlightService) *FlightHandler {
	return &FlightHandler{flightService: flightService}
}

func (h *FlightHandler) ListFlights(w http.ResponseWriter, r *http.Request) {
	flights, err := h.flightService.ListFlights(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, flights)
}

func (h *FlightHandler) GetFlightByID(w http.ResponseWriter, r *http.Request) {
	flightID := r.PathValue("id")

	flight, err := h.flightService.GetFlightByID(r.Context(), flightID)
	if err != nil {
		if errors.Is(err, errs.ErrFlightNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, flight)
}

func (h *FlightHandler) GetFlightByFlightNumber(w http.ResponseWriter, r *http.Request) {
	flightNumber := r.PathValue("flightNumber")

	flight, err := h.flightService.GetFlightByFlightNumber(r.Context(), flightNumber)
	if err != nil {
		if errors.Is(err, errs.ErrFlightNotFound) {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}

		response.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}

	response.JSON(w, http.StatusOK, flight)
}

func (h *FlightHandler) CreateFlight(w http.ResponseWriter, r *http.Request) {
	req := &dto2.CreateFlightRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.flightService.CreateFlight(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrFlightAlreadyExists):
			response.Error(w, http.StatusConflict, err.Error())
		case errors.Is(err, errs.ErrAirportNotFound):
			response.Error(w, http.StatusNotFound, err.Error())
		case errors.Is(err, errs.ErrAircraftNotFound):
			response.Error(w, http.StatusNotFound, err.Error())
		case errors.Is(err, errs.ErrAircraftInactive):
			response.Error(w, http.StatusConflict, err.Error())
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusCreated, map[string]string{
		"message": "flight created",
	})
}

func (h *FlightHandler) UpdateFlightByID(w http.ResponseWriter, r *http.Request) {
	flightID := r.PathValue("id")

	req := &dto2.UpdateFlightRequest{}
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.flightService.UpdateFlight(r.Context(), flightID, req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrFlightNotFound):
			response.Error(w, http.StatusNotFound, err.Error())
		case errors.Is(err, errs.ErrAirportNotFound):
			response.Error(w, http.StatusNotFound, err.Error())
		case errors.Is(err, errs.ErrAircraftNotFound):
			response.Error(w, http.StatusNotFound, err.Error())
		case errors.Is(err, errs.ErrAircraftInactive):
			response.Error(w, http.StatusConflict, err.Error())
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "flight updated",
	})
}

func (h *FlightHandler) DeleteFlightByID(w http.ResponseWriter, r *http.Request) {
	flightID := r.PathValue("id")

	err := h.flightService.DeleteFlight(r.Context(), flightID)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrFlightNotFound):
			response.Error(w, http.StatusNotFound, err.Error())
		default:
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "flight deleted",
	})
}

func (h *FlightHandler) SearchFlights(
	w http.ResponseWriter,
	r *http.Request,
) {
	req := &dto2.FlightSearchRequest{}

	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	log.Println("Received:", req.DepartureDate)

	res, err := h.flightService.SearchFlights(
		r.Context(),
		req,
	)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrAirportNotFound):
			response.Error(w, http.StatusNotFound, err.Error())

		case errors.Is(err, errs.ErrDepartureAndArrivalSame):
			response.Error(w, http.StatusBadRequest, err.Error())

		default:
			log.Println("search flights:", err)
			response.Error(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	response.JSON(w, http.StatusOK, res)
}
