package service

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	domain2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	repository2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/uow"
	utils2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/utils"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/validation"
	"github.com/redis/go-redis/v9"
)

type ReservationService struct {
	reservationRepository repository2.ReservationRepository
	flightRepository      repository2.FlightRepository
	flightSeatRepository  repository2.FlightSeatRepository
	userRepository        repository2.UserRepository

	uow   uow.UnitOfWork
	redis *redis.Client
}

const (
	reservationReferenceLength = 6
	maxReferenceAttempts       = 10
	reservationHoldDuration    = 15 * time.Minute
)

func NewReservationService(
	reservationRepo repository2.ReservationRepository,
	flightRepo repository2.FlightRepository,
	flightSeatRepo repository2.FlightSeatRepository,
	userRepo repository2.UserRepository,
	redis *redis.Client,
	uow uow.UnitOfWork,
) *ReservationService {
	return &ReservationService{
		reservationRepository: reservationRepo,
		flightRepository:      flightRepo,
		flightSeatRepository:  flightSeatRepo,
		userRepository:        userRepo,
		redis:                 redis,
		uow:                   uow,
	}
}

func (s *ReservationService) ReserveSeat(ctx context.Context, reservation *dto.ReserveSeatRequest) error {
	now := time.Now().UTC()

	if err := validation.ValidateReserveSeatRequest(reservation); err != nil {
		return err
	}
	// Validate user
	if err := s.validateReservationUserID(ctx, reservation.UserID); err != nil {
		return err
	}

	// Load flight seat
	flightSeat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return err
	}

	if flightSeat == nil {
		return errs.ErrFlightSeatNotFound
	}

	flight, err := s.flightRepository.GetByID(ctx, flightSeat.FlightID)
	if err != nil {
		return err
	}

	if flight == nil {
		return errs.ErrFlightNotFound
	}

	if flight.Status != domain2.FlightScheduled {
		return errs.ErrFlightStatusInvalid
	}

	if !flight.DepartureTime.After(now) {
		return errs.ErrFlightHasDeparted
	}

	// Check seat available
	if flightSeat.Status != domain2.SeatAvailable {
		return errs.ErrFlightSeatNotAvailable
	}

	// Acquire Redis hold
	key := utils2.GenerateSeatHoldKey(flightSeat.ID)

	ok, err := s.redis.SetNX(ctx, key, reservation.UserID, reservationHoldDuration).Result()
	if err != nil {
		return err
	}

	if !ok {
		return errs.ErrFlightSeatNotAvailable
	}

	// Release the Redis hold unless we succeed.
	success := false
	defer func() {
		if !success {
			_ = s.redis.Del(ctx, key).Err()
		}
	}()

	// Generate reservation reference
	ref, err := s.generateUniqueReservationRef(ctx)
	if err != nil {
		return err
	}

	// Create reservation
	reserve := &domain2.Reservation{
		ID:             uuid.NewString(),
		ReservationRef: ref,
		UserID:         reservation.UserID,
		FlightID:       flightSeat.FlightID,
		FlightSeatID:   flightSeat.ID,
		Status:         domain2.ReservationPending,
		CreatedAt:      now,
		ExpiresAt:      now.Add(reservationHoldDuration),
	}

	err = s.uow.Do(ctx, func(repos uow.Repositories) error {
		if err := repos.Reservation.CreateReservation(ctx, reserve); err != nil {
			return err
		}

		flightSeat.Status = domain2.SeatHeld

		if err := repos.FlightSeat.UpdateFlightSeat(ctx, flightSeat); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	success = true

	return nil
}

func (s *ReservationService) validateReservationUserID(ctx context.Context, userID string) error {
	user, err := s.userRepository.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	if user == nil {
		return errs.ErrUserNotFound
	}

	return nil
}

func (s *ReservationService) validateReservationFlightID(ctx context.Context, flightID string) (*domain2.Flight, error) {
	flight, err := s.flightRepository.GetByID(ctx, flightID)
	if err != nil {
		return nil, err
	}

	if flight == nil {
		return nil, errs.ErrFlightNotFound
	}

	return flight, nil
}

func (s *ReservationService) generateUniqueReservationRef(ctx context.Context) (string, error) {
	for attempt := 0; attempt < maxReferenceAttempts; attempt++ {
		ref, err := utils2.GenerateReservationReference(reservationReferenceLength)
		if err != nil {
			return "", err
		}

		exists, err := s.reservationRefExists(ctx, ref)
		if err != nil {
			return "", err
		}

		if !exists {
			return ref, nil
		}
	}

	return "", errs.ErrReservationReferenceGenerationFailed
}

func (s *ReservationService) reservationRefExists(ctx context.Context, reservationRef string) (bool, error) {
	return s.reservationRepository.ReservationRefExists(ctx, reservationRef)
}

func (s *ReservationService) GetReservationByID(ctx context.Context, id string) (*dto.ReservationResponse, error) {
	if err := validation.ValidateReservationID(id); err != nil {
		return nil, err
	}

	reservation, err := s.reservationRepository.GetReservationByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if reservation == nil {
		return nil, errs.ErrReservationNotFound
	}

	return resvToResponse(reservation), nil
}

func (s *ReservationService) ExpireReservations(ctx context.Context) error {
	now := time.Now().UTC()
	expiredReservations, err := s.reservationRepository.GetExpiredPendingReservations(ctx, now)
	if err != nil {
		return err
	}

	for _, reservation := range expiredReservations {
		flightSeat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)

		if err != nil {
			log.Println(err)
			continue
		}

		//Fallback
		if flightSeat == nil {
			log.Println(errs.ErrFlightSeatNotFound)
			continue
		}

		errTx := s.uow.Do(ctx, func(repos uow.Repositories) error {
			reservation.Status = domain2.ReservationExpired
			if err := repos.Reservation.UpdateReservation(ctx, reservation); err != nil {
				return err
			}

			flightSeat.Status = domain2.SeatAvailable
			if err := repos.FlightSeat.UpdateFlightSeat(ctx, flightSeat); err != nil {
				return err
			}

			//Delete redis hold?

			return nil
		})
		if errTx != nil {
			log.Println(errTx)
			continue
		}

		log.Printf(
			"Expired reservation %s and released seat %s",
			reservation.ReservationRef,
			flightSeat.ID,
		)
	}

	return nil
}

func (s *ReservationService) GetReservationByUserID(ctx context.Context, id string) ([]*dto.ReservationResponse, error) {
	if err := validation.ValidateReservationUserID(id); err != nil {
		return nil, err
	}

	reservations, err := s.reservationRepository.GetReservationsByUserID(ctx, id)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.ReservationResponse, len(reservations))
	for i, reservation := range reservations {
		responses[i] = resvToResponse(reservation)
	}

	return responses, nil
}

func (s *ReservationService) GetReservationByFlightID(ctx context.Context, id string) ([]*dto.ReservationResponse, error) {
	if err := validation.ValidateReservationFlightID(id); err != nil {
		return nil, err
	}

	reservations, err := s.reservationRepository.GetReservationsByFlightID(ctx, id)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.ReservationResponse, len(reservations))
	for i, reservation := range reservations {
		responses[i] = resvToResponse(reservation)
	}

	return responses, nil
}

func (s *ReservationService) ListReservations(ctx context.Context) ([]*dto.ReservationResponse, error) {
	reservations, err := s.reservationRepository.ListReservations(ctx)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.ReservationResponse, len(reservations))
	for i, reservation := range reservations {
		responses[i] = resvToResponse(reservation)
	}

	return responses, nil
}

func (s *ReservationService) CancelReservation(ctx context.Context, reservationID string, userID string) error {
	if err := validation.ValidateReservationID(reservationID); err != nil {
		return err
	}

	if err := validation.ValidateReservationUserID(userID); err != nil {
		return err
	}

	reservation, err := s.reservationRepository.GetReservationByID(ctx, reservationID)
	if err != nil {
		return err
	}

	if reservation == nil {
		return errs.ErrReservationNotFound
	}

	if reservation.UserID != userID {
		return errs.ErrUserReservationMismatch
	}

	if reservation.Status != domain2.ReservationPending {
		return errs.ErrReservationCannotBeCancelled
	}

	seat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return err
	}

	if seat == nil {
		return errs.ErrFlightSeatNotFound
	}

	// Creating a transaction
	txErr := s.uow.Do(ctx, func(repos uow.Repositories) error {

		reservation.Status = domain2.ReservationCancelled
		seat.Status = domain2.SeatAvailable
		if err := repos.Reservation.UpdateReservation(ctx, reservation); err != nil {
			return err
		}

		if err := repos.FlightSeat.UpdateFlightSeat(ctx, seat); err != nil {
			return err
		}

		return nil
	})

	if txErr != nil {
		return txErr
	}

	redisKey := utils2.GenerateSeatHoldKey(reservation.FlightSeatID)
	ok, err := s.redis.Del(ctx, redisKey).Result()
	if err != nil {
		return err
	}

	if ok == 0 {
		log.Printf("No Redis hold found for reservation %s and seat %s", reservation.ReservationRef, reservation.FlightSeatID)
	}

	log.Printf(
		"Cancelled reservation %s and released seat %s",
		reservation.ReservationRef,
		reservation.FlightSeatID,
	)

	return nil

}

func (s *ReservationService) StartExpirationWorker(ctx context.Context) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	log.Println("Reservation expiration worker started")

	for {
		select {
		case <-ctx.Done():
			log.Println("Reservation expiration worker stopped")
			return

		case <-ticker.C:
			if err := s.ExpireReservations(ctx); err != nil {
				log.Println("reservation expiration worker:", err)
			}
		}
	}
}

func (s *ReservationService) ConfirmReservation(ctx context.Context, reservationID string) error {
	if err := validation.ValidateReservationID(reservationID); err != nil {
		return err
	}
	reservation, err := s.reservationRepository.GetReservationByID(ctx, reservationID)
	if err != nil {
		return err
	}

	if reservation == nil {
		return errs.ErrReservationNotFound
	}

	//Really no need to check if user exists as a reservation would inherently require a user
	if reservation.Status != domain2.ReservationPending {
		return errs.ErrInvalidTransactionState
	}

	seat, err := s.flightSeatRepository.GetByID(ctx, reservation.FlightSeatID)
	if err != nil {
		return err
	}

	if seat == nil {
		return errs.ErrFlightSeatNotFound
	}

	if seat.Status != domain2.SeatHeld {
		return errs.ErrReservationCannotBeMade
	}
	//Why check if lock exists is the seat status is on hold no point
	redisKey := utils2.GenerateSeatHoldKey(reservation.FlightSeatID)

	txErr := s.uow.Do(ctx, func(repos uow.Repositories) error {
		return s.confirmReservationTx(
			ctx,
			repos,
			reservation,
			seat,
		)
	})

	if txErr != nil {
		return txErr
	}

	log.Printf(
		"Confirmed reservation %s and booked seat %s",
		reservation.ReservationRef,
		reservation.FlightSeatID,
	)

	ok, err := s.redis.Del(ctx, redisKey).Result()
	if err != nil {
		return err
	}

	if ok == 0 {
		log.Printf(
			"No Redis hold found for reservation %s and seat %s",
			reservation.ReservationRef,
			reservation.FlightSeatID,
		)
	}

	return nil

}

func (s *ReservationService) confirmReservationTx(
	ctx context.Context,
	repos uow.Repositories,
	reservation *domain2.Reservation,
	seat *domain2.FlightSeat,
) error {

	seat.Status = domain2.SeatBooked
	reservation.Status = domain2.ReservationConfirmed

	if err := repos.Reservation.UpdateReservation(ctx, reservation); err != nil {
		return err
	}

	if err := repos.FlightSeat.UpdateFlightSeat(ctx, seat); err != nil {
		return err
	}

	return nil
}

func (s *ReservationService) cancelReservationTx(
	ctx context.Context,
	repos uow.Repositories,
	reservation *domain2.Reservation,
	seat *domain2.FlightSeat,
) error {

	reservation.Status = domain2.ReservationCancelled
	seat.Status = domain2.SeatAvailable

	if err := repos.Reservation.UpdateReservation(
		ctx,
		reservation,
	); err != nil {
		return err
	}

	if err := repos.FlightSeat.UpdateFlightSeat(
		ctx,
		seat,
	); err != nil {
		return err
	}

	return nil
}
