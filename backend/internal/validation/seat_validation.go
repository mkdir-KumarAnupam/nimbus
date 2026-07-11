package validation

import (
	"errors"
	"strings"
)

func ValidateSeatNumber(seatNumber string) error {
	if strings.TrimSpace(seatNumber) == "" {
		return errors.New("seat number cannot be empty")
	}

	if len(seatNumber) > 10 {
		return errors.New("seat number is too long")
	}

	return nil
}

func ValidateSeatClass(class string) error {
	switch class {
	case "economy", "premium_economy", "business", "first":
		return nil
	default:
		return errors.New("invalid seat class")
	}
}

func ValidateSeatAircraftID(aircraftID string) error {
	if strings.TrimSpace(aircraftID) == "" {
		return errors.New("aircraft id cannot be empty")
	}

	return nil
}

func ValidateCreateSeatRequest(req interface{}) error {
	// TODO: Implement seat creation validation
	return nil
}

func ValidateUpdateSeatRequest(req interface{}) error {
	// TODO: Implement seat update validation
	return nil
}
