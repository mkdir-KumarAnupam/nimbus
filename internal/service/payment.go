package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment/razorpay"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/validation"
)

type PaymentService struct {
	paymentRepository     repository.PaymentRepository
	reservationRepository repository.ReservationRepository
	flightSeatRepository  repository.FlightSeatRepository

	bookingWorkflow BookingConfirmer

	gateway payment.PaymentGateway
	keyID   string
}

const DefaultCurrency = "INR"
const DefaultGateway = "razorpay"

func NewPaymentService(
	p repository.PaymentRepository,
	r repository.ReservationRepository,
	f repository.FlightSeatRepository,
	c BookingConfirmer,
	g payment.PaymentGateway,
	keyID string,
) *PaymentService {
	return &PaymentService{
		paymentRepository:     p,
		reservationRepository: r,
		flightSeatRepository:  f,
		gateway:               g,
		keyID:                 keyID,
		bookingWorkflow:       c,
	}
}

func (s *PaymentService) CreatePayment(
	ctx context.Context,
	request payment.CreatePaymentRequest,
) (*payment.CreatePaymentResponse, error) {

	// Validate request
	if err := validation.ValidateCreatePaymentRequest(&request); err != nil {
		return nil, err
	}

	// Load reservation
	reservation, err := s.reservationRepository.GetReservationByID(ctx, request.ReservationID)
	if err != nil {
		return nil, err
	}

	if reservation == nil {
		return nil, errs.ErrReservationNotFound
	}

	if reservation.Status != domain.ReservationPending {
		return nil, errs.ErrInvalidTransactionState
	}

	// Ensure a payment doesn't already exist
	latestPayment, err := s.paymentRepository.GetLatestPaymentByReservationID(
		ctx,
		reservation.ID,
	)
	if err != nil {
		return nil, err
	}

	if latestPayment != nil {
		switch latestPayment.Status {

		case domain.PaymentPending:
			return nil, errs.ErrPaymentAlreadyExists

		case domain.PaymentSucceeded:
			return nil, errs.ErrPaymentAlreadyExists

		case domain.PaymentFailed, domain.PaymentGatewayFailed:

		default:
			return nil, errs.ErrInvalidTransactionState
		}
	}

	count, err := s.paymentRepository.GetPaymentAttemptsCount(
		ctx,
		reservation.ID,
	)

	if err != nil {
		return nil, err
	}

	attempt := count + 1

	// Load flight seat to determine amount
	flightSeat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return nil, err
	}

	if flightSeat == nil {
		return nil, errs.ErrFlightSeatNotFound
	}

	amount := flightSeat.Price

	receipt := fmt.Sprintf(
		"%s-%d",
		reservation.ReservationRef,
		attempt,
	)

	// Create Razorpay order FIRST
	orderReq := payment.CreateOrderRequest{
		Amount:   amount,
		Currency: DefaultCurrency,
		Receipt:  receipt,
	}

	order, err := s.gateway.CreateOrder(ctx, orderReq)

	if err != nil {
		return nil, err
	}
	log.Printf("Razorpay Order ID: %q", order.OrderID)
	now := time.Now().UTC()

	// Persist payment only after we have a valid GatewayOrderID'

	paymentRecord := &domain.Payment{
		ID:             uuid.NewString(),
		ReservationID:  reservation.ID,
		Amount:         amount,
		Currency:       DefaultCurrency,
		Status:         domain.PaymentPending,
		Gateway:        DefaultGateway,
		GatewayOrderID: &order.OrderID,
		Receipt:        receipt,
		CreatedAt:      now,
		UpdatedAt:      now,
		Attempt:        attempt,
	}

	if err := s.paymentRepository.CreatePayment(ctx, paymentRecord); err != nil {
		return nil, err
	}

	return &payment.CreatePaymentResponse{
		OrderID:  order.OrderID,
		KeyID:    s.keyID,
		Amount:   amount,
		Currency: DefaultCurrency,
	}, nil
}

func (s *PaymentService) verifyGatewayPayment(
	ctx context.Context,
	event razorpay.WebhookEvent,
) (*domain.Payment, *payment.PaymentDetails, error) {

	paymentRecord, err := s.paymentRepository.GetPaymentByGatewayOrderID(ctx, event.Payload.Payment.Entity.OrderID)
	if err != nil {
		return nil, nil, err
	}

	if paymentRecord == nil {
		return nil, nil, errs.ErrPaymentNotFound
	}

	if paymentRecord.GatewayOrderID == nil {
		return nil, nil, errs.ErrPaymentOrderIDMissing
	}

	//Get the payment details from razorPay
	paymentDetails, err := s.gateway.GetPayment(ctx, event.Payload.Payment.Entity.ID)
	if err != nil {
		return nil, nil, err
	}

	if paymentDetails == nil {
		return nil, nil, errs.ErrPaymentNotFound
	}

	//Verifying the orderid of our order with the orderid in the payment details
	if paymentDetails.OrderID != *paymentRecord.GatewayOrderID {
		return nil, nil, errs.ErrPaymentOrderMismatch
	}

	//Check the amount matches
	if paymentDetails.Amount != paymentRecord.Amount {
		return nil, nil, errs.ErrPaymentAmountMismatch
	}

	//Verify if the currency is same
	if paymentDetails.Currency != paymentRecord.Currency {
		return nil, nil, errs.ErrPaymentCurrencyMismatch
	}

	return paymentRecord, paymentDetails, nil
}

func (s *PaymentService) handlePaymentCaptured(
	ctx context.Context,
	event razorpay.WebhookEvent,
) error {

	paymentRecord, paymentDetails, err := s.verifyGatewayPayment(ctx, event)
	if err != nil {
		return err
	}
	if paymentDetails.Status != "captured" {
		return errs.ErrPaymentNotCaptured
	}

	switch paymentRecord.Status {
	case domain.PaymentPending:
		// valid transition

	case domain.PaymentSucceeded:
		return nil

	default:
		return errs.ErrInvalidTransactionState
	}

	now := time.Now().UTC()

	paymentRecord.Status = domain.PaymentSucceeded
	paymentRecord.GatewayPaymentID = &paymentDetails.ID
	paymentRecord.UpdatedAt = now

	err = s.paymentRepository.UpdatePayment(ctx, paymentRecord)
	if err != nil {
		return err
	}

	return s.bookingWorkflow.ConfirmBooking(ctx, paymentRecord.ReservationID)

}

func (s *PaymentService) handlePaymentFailed(
	ctx context.Context,
	event razorpay.WebhookEvent,
) error {
	paymentRecord, paymentDetails, err := s.verifyGatewayPayment(ctx, event)
	if err != nil {
		return err
	}
	if paymentDetails.Status != "failed" {
		return errs.ErrPaymentNotFailed
	}

	// Validate state transition
	switch paymentRecord.Status {
	case domain.PaymentPending:
		// valid transition

	case domain.PaymentFailed,
		domain.PaymentGatewayFailed:
		return nil

	default:
		return errs.ErrInvalidTransactionState
	}

	now := time.Now().UTC()

	paymentRecord.Status = domain.PaymentFailed
	paymentRecord.GatewayPaymentID = &paymentDetails.ID
	paymentRecord.UpdatedAt = now

	if err := s.paymentRepository.UpdatePayment(ctx, paymentRecord); err != nil {
		return err
	}

	return nil
}

func (s *PaymentService) HandleWebhook(
	ctx context.Context,
	body []byte,
	signature string,
) error {

	if err := s.gateway.VerifyWebhookSignature(body, signature); err != nil {
		return err
	}

	var event razorpay.WebhookEvent

	if err := json.Unmarshal(body, &event); err != nil {
		return err
	}

	switch event.Event {

	case "payment.captured":
		return s.handlePaymentCaptured(ctx, event)

	case "payment.failed":
		return s.handlePaymentFailed(ctx, event)

	default:
		return nil
	}
}
