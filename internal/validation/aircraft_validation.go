package validation

import (
	"errors"
	"strings"
)

func ValidateAircraftRegistration(registration string) error {
	if strings.TrimSpace(registration) == "" {
		return errors.New("aircraft registration cannot be empty")
	}

	if len(registration) > 20 {
		return errors.New("aircraft registration is too long")
	}

	for _, r := range registration {
		switch {
		case r >= 'A' && r <= 'Z':
		case r >= '0' && r <= '9':
		case r == '-':
		default:
			return errors.New("aircraft registration must contain only letters, numbers, or hyphens")
		}
	}

	return nil
}

func ValidateAircraftModel(model string) error {
	if strings.TrimSpace(model) == "" {
		return errors.New("aircraft model cannot be empty")
	}

	if len(model) > 100 {
		return errors.New("aircraft model is too long")
	}

	return nil
}

func ValidateAircraftTotalSeats(totalSeats int) error {
	if totalSeats <= 0 {
		return errors.New("aircraft total seats must be greater than zero")
	}

	return nil
}

func ValidateAircraftStatus(status string) error {
	switch status {
	case "active", "maintenance", "retired":
		return nil
	default:
		return errors.New("invalid aircraft status")
	}
}
