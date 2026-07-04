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
	ErrSeatAlreadyBooked  = errors.New("seat is already booked")
	ErrReservationExpired = errors.New("reservation has expired")

	// Flight errors
	ErrFlightNotFound      = errors.New("flight not found")
	ErrFlightAlreadyExists = errors.New("flight already exists")

	// Airport errors
	ErrAirportNotFound      = errors.New("airport not found")
	ErrAirportAlreadyExists = errors.New("airport already exists")

	// Aircraft errors
	ErrAircraftNotFound      = errors.New("aircraft not found")
	ErrAircraftAlreadyExists = errors.New("aircraft already exists")
	ErrAircraftInactive      = errors.New("aircraft is inactive")
)
