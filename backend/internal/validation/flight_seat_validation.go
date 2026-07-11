package validation

import (
	"errors"
	"strings"
)

func ValidateFlightSeatFlightID(flightID string) error {
	if strings.TrimSpace(flightID) == "" {
		return errors.New("flight id cannot be empty")
	}

	return nil
}

func ValidateFlightSeatSeatID(seatID string) error {
	if strings.TrimSpace(seatID) == "" {
		return errors.New("seat id cannot be empty")
	}

	return nil
}

func ValidateFlightSeatStatus(status string) error {
	switch status {
	case "available", "held", "booked", "blocked":
		return nil
	default:
		return errors.New("invalid flight seat status")
	}
}

func ValidateFlightSeatPrice(price int64) error {
	if price <= 0 {
		return errors.New("flight seat price must be greater than zero")
	}

	return nil
}

func ValidateCreateFlightSeatRequest(req interface{}) error {
	// TODO: Implement flight seat creation validation
	return nil
}

func ValidateUpdateFlightSeatRequest(req interface{}) error {
	// TODO: Implement flight seat update validation
	return nil
}
