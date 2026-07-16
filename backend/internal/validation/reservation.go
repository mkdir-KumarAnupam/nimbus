package validation

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
)

const maxReservationRefLength = 20

func ValidateReservationReference(reference string) error {
	reference = strings.ToUpper(strings.TrimSpace(reference))

	if reference == "" {
		return errors.New("reservation reference cannot be empty")
	}

	if len(reference) > maxReservationRefLength {
		return errors.New("reservation reference is too long")
	}

	for _, r := range reference {
		switch {
		case r >= 'A' && r <= 'Z':
		case r >= '0' && r <= '9':
		case r == '-':
		default:
			return errors.New("reservation reference must contain only letters, numbers, or hyphens")
		}
	}

	return nil
}

func ValidateReservationID(id string) error {
	id = strings.TrimSpace(id)

	if id == "" {
		return errors.New("reservation id cannot be empty")
	}

	if _, err := uuid.Parse(id); err != nil {
		return errors.New("reservation id must be a valid uuid")
	}

	return nil
}

func ValidateReservationUserID(userID string) error {
	userID = strings.TrimSpace(userID)

	if userID == "" {
		return errors.New("user id cannot be empty")
	}

	if _, err := uuid.Parse(userID); err != nil {
		return errors.New("user id must be a valid uuid")
	}

	return nil
}

func ValidateReservationFlightSeatID(flightSeatID string) error {
	flightSeatID = strings.TrimSpace(flightSeatID)

	if flightSeatID == "" {
		return errors.New("flight seat id cannot be empty")
	}

	if _, err := uuid.Parse(flightSeatID); err != nil {
		return errors.New("flight seat id must be a valid uuid")
	}

	return nil
}

func ValidateReservationFlightID(flightID string) error {
	flightID = strings.TrimSpace(flightID)

	if flightID == "" {
		return errors.New("flight id cannot be empty")
	}

	if _, err := uuid.Parse(flightID); err != nil {
		return errors.New("flight id must be a valid uuid")
	}

	return nil
}

func ValidateCreateReservationRequest(req *dto.CreateReservationRequest) error {
	if req == nil {
		return errors.New("request cannot be nil")
	}

	req.UserID = strings.TrimSpace(req.UserID)
	req.FlightID = strings.TrimSpace(req.FlightID)

	if err := ValidateReservationUserID(req.UserID); err != nil {
		return err
	}

	if err := ValidateReservationFlightID(req.FlightID); err != nil {
		return err
	}

	return nil
}

func ValidateReservationStatus(status string) error {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case string(domain.ReservationPending),
		string(domain.ReservationConfirmed),
		string(domain.ReservationCancelled),
		string(domain.ReservationExpired):
		return nil
	default:
		return errors.New("invalid reservation status")
	}
}

func ValidateReserveSeatRequest(req *dto.ReserveSeatRequest) error {
	if req == nil {
		return errors.New("request cannot be nil")
	}

	req.UserID = strings.TrimSpace(req.UserID)
	req.FlightSeatID = strings.TrimSpace(req.FlightSeatID)

	if err := ValidateReservationUserID(req.UserID); err != nil {
		return err
	}

	if err := ValidateReservationFlightSeatID(req.FlightSeatID); err != nil {
		return err
	}

	return nil
}
