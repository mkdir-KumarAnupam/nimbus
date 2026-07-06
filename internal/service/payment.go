package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/validation"
)

type PaymentService struct {
	paymentRepository     repository.PaymentRepository
	reservationRepository repository.ReservationRepository
	flightSeatRepository  repository.FlightSeatRepository

	gateway payment.PaymentGateway
	keyID   string
}

const DefaultCurrency = "INR"
const DefaultGateway = "razorpay"
const DefaultStatus = domain.PaymentCreating

func NewPaymentService(p repository.PaymentRepository, r repository.ReservationRepository, f repository.FlightSeatRepository, g payment.PaymentGateway, keyID string) *PaymentService {
	return &PaymentService{
		paymentRepository:     p,
		reservationRepository: r,
		flightSeatRepository:  f,
		gateway:               g,
		keyID:                 keyID,
	}
}

func (s *PaymentService) CreatePayment(ctx context.Context, request payment.CreatePaymentRequest) (*payment.CreatePaymentResponse, error) {
	//Validate
	err := validation.ValidateCreatePaymentRequest(&request)
	if err != nil {
		return nil, err
	}

	//Load
	reservation, err := s.reservationRepository.GetReservationByID(ctx, request.ReservationID)
	if err != nil {
		return nil, err
	}

	if reservation == nil {
		return nil, errs.ErrReservationNotFound
	}

	//Verify if pending
	if reservation.Status != domain.ReservationPending {
		return nil, errs.ErrInvalidTransactionState
	}

	//Check if payment exists
	existingPayment, err := s.paymentRepository.GetPaymentByReservationID(ctx, reservation.ID)
	if err != nil {
		return nil, err
	}

	if existingPayment != nil {
		return nil, errs.ErrPaymentAlreadyExists
	}

	//Amount to pay
	flightSeat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return nil, err
	}

	if flightSeat == nil {
		return nil, errs.ErrFlightSeatNotFound
	}

	amount := flightSeat.Price

	now := time.Now().UTC()
	//Create a payment record
	createdPaymentRecord := domain.Payment{
		ID:            uuid.NewString(),
		ReservationID: reservation.ID,
		Amount:        amount,
		Currency:      DefaultCurrency,
		Status:        DefaultStatus,
		Gateway:       DefaultGateway,
		CreatedAt:     now,
		UpdatedAt:     now,
		Receipt:       reservation.ReservationRef,
	}

	err = s.paymentRepository.CreatePayment(ctx, &createdPaymentRecord)
	if err != nil {
		return nil, err
	}

	orderReq := payment.CreateOrderRequest{
		Amount:   amount,
		Currency: DefaultCurrency,
		Receipt:  reservation.ReservationRef,
	}

	order, err := s.gateway.CreateOrder(ctx, orderReq)
	if err != nil {
		createdPaymentRecord.Status = domain.PaymentGatewayFailed
		createdPaymentRecord.UpdatedAt = time.Now().UTC()

		_ = s.paymentRepository.UpdatePayment(ctx, &createdPaymentRecord)

		return nil, err
	}

	createdPaymentRecord.Status = domain.PaymentPending
	createdPaymentRecord.GatewayOrderID = order.OrderID
	createdPaymentRecord.UpdatedAt = time.Now().UTC()

	err = s.paymentRepository.UpdatePayment(ctx, &createdPaymentRecord)
	if err != nil {
		return nil, err
	}

	response := &payment.CreatePaymentResponse{
		OrderID:  order.OrderID,
		KeyID:    s.keyID,
		Amount:   amount,
		Currency: DefaultCurrency,
	}

	return response, nil

}
