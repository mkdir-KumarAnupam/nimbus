package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/payment"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/service"
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
		errs.ErrFlightSeatNotFound,
		errs.ErrPaymentNotFound,
		errs.ErrRefundNotFound:
		http.Error(w, err.Error(), http.StatusNotFound)

	case errs.ErrPaymentAlreadyExists,
		errs.ErrPaymentNotRefundable,
		errs.ErrRefundAlreadyPending,
		errs.ErrAlreadyRefunded,
		errs.ErrInvalidTransactionState:
		http.Error(w, err.Error(), http.StatusConflict)

	default:
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}

func (h *PaymentHandler) Webhook(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read request body", http.StatusBadRequest)
		return
	}

	signature := r.Header.Get("X-Razorpay-Signature")
	if signature == "" {
		http.Error(w, "missing razorpay signature", http.StatusUnauthorized)
		return
	}

	if err := h.paymentService.HandleWebhook(ctx, body, signature); err != nil {
		log.Println("webhook:", err)
		http.Error(w, "invalid webhook", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *PaymentHandler) RequestRefund(
	w http.ResponseWriter,
	r *http.Request,
) {
	var req payment.RequestRefundRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response, err := h.paymentService.RequestRefund(
		r.Context(),
		req,
	)
	if err != nil {
		writePaymentError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
	}
}

func (h *PaymentHandler) GetPaymentSummary(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("reservationId")

	if reservationID == "" {
		http.Error(w, "missing reservationId", http.StatusBadRequest)
		return
	}

	response, err := h.paymentService.GetPaymentSummary(r.Context(), reservationID)
	if err != nil {
		writePaymentError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
