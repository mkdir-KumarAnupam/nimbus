package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
)

type PaymentHandler struct {
	paymentService *service.PaymentService
}

func NewPaymentHandler(paymentService *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
	}
}

func (h *PaymentHandler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	var req payment.CreatePaymentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response, err := h.paymentService.CreatePayment(r.Context(), req)
	if err != nil {
		writePaymentError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func writePaymentError(w http.ResponseWriter, err error) {
	switch err {

	case errs.ErrReservationNotFound,
		errs.ErrFlightSeatNotFound:
		http.Error(w, err.Error(), http.StatusNotFound)

	case errs.ErrPaymentAlreadyExists,
		errs.ErrInvalidTransactionState:
		http.Error(w, err.Error(), http.StatusConflict)

	default:
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}
