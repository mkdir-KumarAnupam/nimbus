package errs

import "errors"

var (
	// User errors
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrUsernameTaken      = errors.New("username is already taken")

	// Authentication errors
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidToken       = errors.New("invalid token")
	ErrUnauthorized       = errors.New("unauthorized")

	// Reservation errors
	ErrSeatAlreadyBooked                    = errors.New("seat is already booked")
	ErrReservationExpired                   = errors.New("reservation has expired")
	ErrReservationNotFound                  = errors.New("reservation not found")
	ErrReservationAlreadyBooked             = errors.New("reservation is already booked")
	ErrUserReservationMismatch              = errors.New("user reservation mismatch")
	ErrReservationCannotBeCancelled         = errors.New("reservation can not be cancelled")
	ErrReservationReferenceGenerationFailed = errors.New("failed to generate unique reservation reference")
	ErrReservationCannotBeMade              = errors.New("failed to make reservation")
	ErrInvalidTransactionState              = errors.New("invalid transaction state")

	// Flight errors
	ErrFlightNotFound        = errors.New("flight not found")
	ErrFlightAlreadyExists   = errors.New("flight already exists")
	ErrFlightStatusInvalid   = errors.New("flight status is invalid")
	ErrFlightHasDeparted     = errors.New("flight has departed")
	ErrFlightInventoryExists = errors.New("flight inventory already exists")

	// Airport errors
	ErrAirportNotFound      = errors.New("airport not found")
	ErrAirportAlreadyExists = errors.New("airport already exists")

	// Aircraft errors
	ErrAircraftNotFound      = errors.New("aircraft not found")
	ErrAircraftAlreadyExists = errors.New("aircraft already exists")
	ErrAircraftInactive      = errors.New("aircraft is inactive")
	ErrAircraftStatusInvalid = errors.New("aircraft status is invalid")
	ErrAircraftHasNoSeats    = errors.New("aircraft has no seats")

	// Seat errors
	ErrSeatNotFound      = errors.New("seat not found")
	ErrSeatAlreadyExists = errors.New("seat already exists")

	// FlightSeat errors
	ErrFlightSeatNotFound      = errors.New("flight seat not found")
	ErrFlightSeatAlreadyExists = errors.New("flight seat already exists")
	ErrFlightSeatNotAvailable  = errors.New("flight seat is not available")

	//Transaction errors
	ErrTransactionReservationFailed = errors.New("transaction while confirming reservation failed")
)
