package validation

import (
	"errors"
	"strings"
	"time"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
)

func ValidatePassengerName(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("name cannot be empty")
	}
	if len(name) > 100 {
		return errors.New("name is too long")
	}
	return nil
}

func ValidatePassengerGender(gender string) error {
	switch strings.ToLower(strings.TrimSpace(gender)) {
	case "male", "female", "other":
		return nil
	default:
		return errors.New("invalid gender")
	}
}

func ValidatePassengerDateOfBirth(dob time.Time) error {
	if dob.IsZero() {
		return errors.New("date of birth is required")
	}
	if dob.After(time.Now()) {
		return errors.New("date of birth cannot be in the future")
	}
	return nil
}

func ValidatePassengerNationality(nationality string) error {
	if strings.TrimSpace(nationality) == "" {
		return errors.New("nationality cannot be empty")
	}
	return nil
}

func ValidateCreatePassengerRequest(req *dto.CreatePassengerRequest) error {
	if err := ValidatePassengerName(req.FirstName); err != nil {
		return err
	}
	if err := ValidatePassengerName(req.LastName); err != nil {
		return err
	}
	if err := ValidateEmail(req.Email); err != nil {
		return err
	}
	if strings.TrimSpace(req.Phone) == "" {
		return errors.New("phone cannot be empty")
	}
	if err := ValidatePassengerGender(req.Gender); err != nil {
		return err
	}
	if err := ValidatePassengerDateOfBirth(req.DateOfBirth); err != nil {
		return err
	}
	if err := ValidatePassengerNationality(req.Nationality); err != nil {
		return err
	}

	if req.PassportNumber != nil && strings.TrimSpace(*req.PassportNumber) == "" {
		return errors.New("passport number cannot be empty if provided")
	}
	if req.PassportExpiry != nil && req.PassportExpiry.Before(time.Now()) {
		return errors.New("passport has already expired")
	}
	if req.PassportCountry != nil && strings.TrimSpace(*req.PassportCountry) == "" {
		return errors.New("passport country cannot be empty if provided")
	}

	return nil
}

func ValidateUpdatePassengerRequest(req *dto.UpdatePassengerRequest) error {
	if err := ValidatePassengerName(req.FirstName); err != nil {
		return err
	}
	if err := ValidatePassengerName(req.LastName); err != nil {
		return err
	}
	if err := ValidateEmail(req.Email); err != nil {
		return err
	}
	if strings.TrimSpace(req.Phone) == "" {
		return errors.New("phone cannot be empty")
	}
	if err := ValidatePassengerGender(req.Gender); err != nil {
		return err
	}
	if err := ValidatePassengerDateOfBirth(req.DateOfBirth); err != nil {
		return err
	}
	if err := ValidatePassengerNationality(req.Nationality); err != nil {
		return err
	}

	if req.PassportNumber != nil && strings.TrimSpace(*req.PassportNumber) == "" {
		return errors.New("passport number cannot be empty if provided")
	}
	if req.PassportExpiry != nil && req.PassportExpiry.Before(time.Now()) {
		return errors.New("passport has already expired")
	}
	if req.PassportCountry != nil && strings.TrimSpace(*req.PassportCountry) == "" {
		return errors.New("passport country cannot be empty if provided")
	}

	return nil
}

func ValidatePassengerID(id string) error {
	if strings.TrimSpace(id) == "" {
		return errors.New("passenger id cannot be empty")
	}
	return nil
}
