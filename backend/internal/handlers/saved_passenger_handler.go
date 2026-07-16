package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/middleware"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/response"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
)

type SavedPassengerHandler struct {
	service *service.SavedPassengerService
}

func NewSavedPassengerHandler(service *service.SavedPassengerService) *SavedPassengerHandler {
	return &SavedPassengerHandler{service: service}
}

func (h *SavedPassengerHandler) CreateSavedPassenger(w http.ResponseWriter, r *http.Request) {
	value := r.Context().Value(middleware.UserContextKey)
	claims, ok := value.(*auth.Claims)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.Subject

	var req dto.SavedPassengerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	res, err := h.service.CreateSavedPassenger(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, res)
}

func (h *SavedPassengerHandler) GetSavedPassengers(w http.ResponseWriter, r *http.Request) {
	value := r.Context().Value(middleware.UserContextKey)
	claims, ok := value.(*auth.Claims)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.Subject

	res, err := h.service.GetSavedPassengersByUserID(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, res)
}

func (h *SavedPassengerHandler) UpdateSavedPassenger(w http.ResponseWriter, r *http.Request) {
	value := r.Context().Value(middleware.UserContextKey)
	claims, ok := value.(*auth.Claims)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.Subject

	parts := strings.Split(r.URL.Path, "/")
	id := parts[len(parts)-1]
	if id == "" {
		response.Error(w, http.StatusBadRequest, "Passenger ID is required")
		return
	}

	var req dto.SavedPassengerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	res, err := h.service.UpdateSavedPassenger(r.Context(), id, userID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, res)
}

func (h *SavedPassengerHandler) DeleteSavedPassenger(w http.ResponseWriter, r *http.Request) {
	value := r.Context().Value(middleware.UserContextKey)
	claims, ok := value.(*auth.Claims)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.Subject

	parts := strings.Split(r.URL.Path, "/")
	id := parts[len(parts)-1]
	if id == "" {
		response.Error(w, http.StatusBadRequest, "Passenger ID is required")
		return
	}

	if err := h.service.DeleteSavedPassenger(r.Context(), id, userID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
