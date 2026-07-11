package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/response"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/service"
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

func (h *AirportHandler) ListAirports(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := r.Context()

	airports, err := h.airportService.ListAirports(ctx)
	if err != nil {
		response.Error(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	response.JSON(
		w,
		http.StatusOK,
		airports,
	)
}

func (h *AirportHandler) SearchAirports(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := r.Context()

	query := strings.TrimSpace(
		r.URL.Query().Get("query"),
	)

	if query == "" {
		response.Error(
			w,
			http.StatusBadRequest,
			"query parameter is required",
		)
		return
	}

	limit := 10

	if value := r.URL.Query().Get("limit"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed <= 0 {
			response.Error(
				w,
				http.StatusBadRequest,
				"invalid limit",
			)
			return
		}

		limit = parsed
	}

	airports, err := h.airportService.SearchAirports(
		ctx,
		query,
		limit,
	)
	if err != nil {
		response.Error(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	response.JSON(
		w,
		http.StatusOK,
		airports,
	)
}
