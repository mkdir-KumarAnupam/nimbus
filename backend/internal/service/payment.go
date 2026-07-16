package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	domain2 "github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	payment2 "github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment/razorpay"
	repository2 "github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	validation2 "github.com/mkdir-KumarAnupam/airline-booking/internal/validation"
)

type PaymentService struct {
	paymentRepository     repository2.PaymentRepository
	reservationRepository repository2.ReservationRepository
	flightSeatRepository  repository2.FlightSeatRepository
	refundRepository      repository2.RefundRepository
	bookingWorkflow       BookingWorkflow

	gateway payment2.PaymentGateway
	keyID   string
}

const DefaultCurrency = "INR"
const DefaultGateway = "razorpay"

func NewPaymentService(
	p repository2.PaymentRepository,
	r repository2.ReservationRepository,
	f repository2.FlightSeatRepository,
	c BookingWorkflow,
	g payment2.PaymentGateway,
	l repository2.RefundRepository,
	keyID string,
) *PaymentService {
	return &PaymentService{
		paymentRepository:     p,
		reservationRepository: r,
		flightSeatRepository:  f,
		gateway:               g,
		keyID:                 keyID,
		bookingWorkflow:       c,
		refundRepository:      l,
	}
}

func (s *PaymentService) CreatePayment(
	ctx context.Context,
	request payment2.CreatePaymentRequest,
) (*payment2.CreatePaymentResponse, error) {

	// Validate request
	if err := validation2.ValidateCreatePaymentRequest(&request); err != nil {
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

	if reservation.Status != domain2.ReservationPending {
		return nil, errs.ErrInvalidTransactionState
	}

	// Ensure a payment doesn'layout already exist
	latestPayment, err := s.paymentRepository.GetLatestPaymentByReservationID(
		ctx,
		reservation.ID,
	)
	if err != nil {
		return nil, err
	}

	if latestPayment != nil {
		switch latestPayment.Status {

		case domain2.PaymentPending:
			if latestPayment.GatewayOrderID != nil {
				return &payment2.CreatePaymentResponse{
					OrderID:  *latestPayment.GatewayOrderID,
					Amount:   latestPayment.Amount,
					Currency: latestPayment.Currency,
					KeyID:    s.keyID,
				}, nil
			}
			return nil, errs.ErrPaymentAlreadyExists

		case domain2.PaymentSucceeded:
			return nil, errs.ErrPaymentAlreadyExists

		case domain2.PaymentFailed, domain2.PaymentGatewayFailed:

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
	orderReq := payment2.CreateOrderRequest{
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

	// Persist payment only after we have a valid GatewayOrderID

	paymentRecord := &domain2.Payment{
		ID:             uuid.NewString(),
		ReservationID:  reservation.ID,
		Amount:         amount,
		Currency:       DefaultCurrency,
		Status:         domain2.PaymentPending,
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

	return &payment2.CreatePaymentResponse{
		OrderID:  order.OrderID,
		KeyID:    s.keyID,
		Amount:   amount,
		Currency: DefaultCurrency,
	}, nil
}

func (s *PaymentService) verifyGatewayPayment(
	ctx context.Context,
	event razorpay.WebhookEvent,
) (*domain2.Payment, *payment2.PaymentDetails, error) {

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
	case domain2.PaymentPending:
		// valid transition

	case domain2.PaymentSucceeded:
		return nil

	default:
		return errs.ErrInvalidTransactionState
	}

	now := time.Now().UTC()

	paymentRecord.Status = domain2.PaymentSucceeded
	paymentRecord.GatewayPaymentID = &paymentDetails.ID
	paymentRecord.UpdatedAt = now

	err = s.paymentRepository.UpdatePayment(ctx, paymentRecord)
	if err != nil {
		return err
	}

	//Triggering the workflow after payment is completed
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
	case domain2.PaymentPending:
		// valid transition

	case domain2.PaymentFailed,
		domain2.PaymentGatewayFailed:
		return nil

	default:
		return errs.ErrInvalidTransactionState
	}

	now := time.Now().UTC()

	paymentRecord.Status = domain2.PaymentFailed
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

	case "refund.processed":
		return s.handleRefundProcessed(
			ctx,
			event.Payload.Refund.Entity.ID,
		)

	case "refund.failed":
		return s.handleRefundFailed(
			ctx,
			event.Payload.Refund.Entity.ID,
		)

	default:
		return nil
	}
}

func (s *PaymentService) RequestRefund(
	ctx context.Context,
	request payment2.RequestRefundRequest,
) (*payment2.RequestRefundResponse, error) {
	if err := validation2.ValidateRequestRefundRequest(&request); err != nil {
		return nil, err
	}

	paymentRecord, err := s.paymentRepository.GetLatestPaymentByReservationID(
		ctx,
		request.ReservationID)
	if err != nil {
		return nil, err
	}

	if paymentRecord == nil {
		return nil, errs.ErrPaymentNotFound
	}

	if paymentRecord.GatewayPaymentID == nil {
		return nil, errs.ErrGatewayPaymentIDMissing
	}

	if paymentRecord.Status != domain2.PaymentSucceeded {
		return nil, errs.ErrPaymentNotRefundable
	}

	refundRecord, err := s.refundRepository.GetRefundByPaymentID(
		ctx,
		paymentRecord.ID,
	)
	if err != nil {
		return nil, err
	}

	if refundRecord != nil {
		switch refundRecord.Status {

		case domain2.RefundPending:
			return nil, errs.ErrRefundAlreadyPending

		case domain2.RefundSucceeded:
			return nil, errs.ErrAlreadyRefunded

		case domain2.RefundFailed:
			// allow retry
			break

		default:
			return nil, errs.ErrInvalidTransactionState
		}
	}

	refundReq := payment2.RefundRequest{
		PaymentID: *paymentRecord.GatewayPaymentID,
		Amount:    paymentRecord.Amount,
	}

	gatewayRefund, err := s.gateway.RefundPayment(
		ctx,
		refundReq,
	)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()

	isNewRefund := refundRecord == nil

	if isNewRefund {
		refundRecord = &domain2.Refund{
			ID:        uuid.NewString(),
			PaymentID: paymentRecord.ID,
			CreatedAt: now,
		}
	}

	refundRecord.GatewayRefundID = &gatewayRefund.RefundID
	refundRecord.Amount = paymentRecord.Amount
	refundRecord.Currency = paymentRecord.Currency
	refundRecord.Reason = request.Reason
	refundRecord.Status = domain2.RefundPending
	refundRecord.UpdatedAt = now

	if isNewRefund {
		if err := s.refundRepository.CreateRefund(
			ctx,
			refundRecord,
		); err != nil {
			return nil, err
		}
	} else {
		if err := s.refundRepository.UpdateRefund(
			ctx,
			refundRecord,
		); err != nil {
			return nil, err
		}
	}

	return &payment2.RequestRefundResponse{
		RefundID: refundRecord.ID,
		Status:   refundRecord.Status,
	}, nil

}

func (s *PaymentService) verifyGatewayRefund(
	ctx context.Context,
	gatewayRefundID string,
) (*domain2.Refund, *payment2.RefundDetails, error) {

	// Load the refund from our database
	refundRecord, err := s.refundRepository.GetRefundByGatewayRefundID(
		ctx,
		gatewayRefundID,
	)
	if err != nil {
		return nil, nil, err
	}

	if refundRecord == nil {
		return nil, nil, errs.ErrRefundNotFound
	}

	if refundRecord.GatewayRefundID == nil {
		return nil, nil, errs.ErrGatewayRefundIDMissing
	}

	// Get the authoritative refund details from Razorpay
	refundDetails, err := s.gateway.GetRefund(
		ctx,
		gatewayRefundID,
	)
	if err != nil {
		return nil, nil, err
	}

	if refundDetails == nil {
		return nil, nil, errs.ErrRefundNotFound
	}

	// Verify the refund IDs match
	if refundDetails.ID != *refundRecord.GatewayRefundID {
		return nil, nil, errs.ErrRefundIDMismatch
	}

	// Load payment
	paymentRecord, err := s.paymentRepository.GetPaymentByID(
		ctx,
		refundRecord.PaymentID,
	)
	if err != nil {
		return nil, nil, err
	}

	if paymentRecord == nil {
		return nil, nil, errs.ErrPaymentNotFound
	}

	if paymentRecord.GatewayPaymentID == nil {
		return nil, nil, errs.ErrGatewayPaymentIDMissing
	}

	// Verify the refund belongs to the expected payment
	if refundDetails.PaymentID != *paymentRecord.GatewayPaymentID {
		return nil, nil, errs.ErrPaymentMismatch
	}

	// Verify the refund amount
	if refundDetails.Amount != refundRecord.Amount {
		return nil, nil, errs.ErrRefundAmountMismatch
	}

	// Verify the refund currency
	if refundDetails.Currency != refundRecord.Currency {
		return nil, nil, errs.ErrRefundCurrencyMismatch
	}

	return refundRecord, refundDetails, nil
}

func (s *PaymentService) handleRefundProcessed(
	ctx context.Context,
	gatewayRefundID string,
) error {

	// Verify the refund with Razorpay and our database.
	refundRecord, refundDetails, err := s.verifyGatewayRefund(
		ctx,
		gatewayRefundID,
	)
	if err != nil {
		return err
	}

	// The refund must actually be processed.
	if refundDetails.Status != "processed" {
		return errs.ErrRefundNotProcessed
	}

	// Ensure this is a valid state transition.
	switch refundRecord.Status {

	case domain2.RefundPending:
		// valid transition

	case domain2.RefundSucceeded:
		// Webhooks are retried by Razorpay.
		// We've already processed this refund.
		return nil

	default:
		return errs.ErrInvalidTransactionState
	}

	// Load the associated payment.
	paymentRecord, err := s.paymentRepository.GetPaymentByID(
		ctx,
		refundRecord.PaymentID,
	)
	if err != nil {
		return err
	}

	if paymentRecord == nil {
		return errs.ErrPaymentNotFound
	}

	//Cancel the booking
	err = s.bookingWorkflow.CancelBooking(
		ctx,
		paymentRecord.ReservationID,
	)
	if err != nil {
		return err
	}

	// Mark the refund as completed.
	now := time.Now().UTC()

	refundRecord.Status = domain2.RefundSucceeded
	refundRecord.UpdatedAt = now

	if err := s.refundRepository.UpdateRefund(
		ctx,
		refundRecord,
	); err != nil {
		return err
	}

	// Mark the payment as refunded.
	paymentRecord.Status = domain2.PaymentRefunded
	paymentRecord.UpdatedAt = now

	if err := s.paymentRepository.UpdatePayment(
		ctx,
		paymentRecord,
	); err != nil {
		return err
	}
	return nil
}

func (s *PaymentService) handleRefundFailed(
	ctx context.Context,
	gatewayRefundID string,
) error {

	refundRecord, refundDetails, err := s.verifyGatewayRefund(
		ctx,
		gatewayRefundID,
	)
	if err != nil {
		return err
	}

	if refundDetails.Status != "failed" {
		return errs.ErrRefundNotFailed
	}

	switch refundRecord.Status {

	case domain2.RefundPending:
		// valid

	case domain2.RefundFailed:
		return nil

	default:
		return errs.ErrInvalidTransactionState
	}

	refundRecord.Status = domain2.RefundFailed
	refundRecord.UpdatedAt = time.Now().UTC()

	return s.refundRepository.UpdateRefund(
		ctx,
		refundRecord,
	)
}

func (s *PaymentService) GetPaymentSummary(
	ctx context.Context,
	reservationID string,
) (*payment2.PaymentSummaryResponse, error) {
	paymentRecord, err := s.paymentRepository.GetLatestPaymentByReservationID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	if paymentRecord == nil {
		return nil, errs.ErrPaymentNotFound
	}

	summary := &payment2.PaymentSummaryResponse{
		Amount:   paymentRecord.Amount,
		Currency: paymentRecord.Currency,
		Status:   string(paymentRecord.Status),
	}

	refundRecord, err := s.refundRepository.GetRefundByPaymentID(ctx, paymentRecord.ID)
	if err != nil {
		return nil, err
	}

	if refundRecord != nil {
		summary.RefundStatus = string(refundRecord.Status)
	}

	return summary, nil
}
