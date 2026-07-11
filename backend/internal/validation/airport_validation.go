package validation

import (
	"errors"
	"strings"
)

func ValidateAirportCode(code string) error {
	if strings.TrimSpace(code) == "" {
		return errors.New("airport code cannot be empty")
	}

	if len(code) != 3 {
		return errors.New("airport code must be exactly 3 characters")
	}

	if code != strings.ToUpper(code) {
		return errors.New("airport code must be uppercase")
	}

	for _, r := range code {
		if r < 'A' || r > 'Z' {
			return errors.New("airport code must contain only letters")
		}
	}

	return nil
}
func ValidateAirportName(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("airport name cannot be empty")
	}

	if len(name) > 100 {
		return errors.New("airport name is too long")
	}

	return nil
}
func ValidateAirportCity(city string) error {
	if strings.TrimSpace(city) == "" {
		return errors.New("airport city cannot be empty")
	}

	if len(city) > 100 {
		return errors.New("airport city is too long")
	}

	return nil
}
func ValidateAirportCountry(country string) error {
	if strings.TrimSpace(country) == "" {
		return errors.New("airport country cannot be empty")
	}

	if len(country) > 100 {
		return errors.New("airport country is too long")
	}

	return nil
}

func ValidateAirportTimezone(timezone string) error {
	if strings.TrimSpace(timezone) == "" {
		return errors.New("airport timezone cannot be empty")
	}

	if len(timezone) > 100 {
		return errors.New("airport timezone is too long")
	}

	return nil
}
