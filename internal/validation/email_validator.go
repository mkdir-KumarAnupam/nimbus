package validation

import (
	"errors"
	"net/mail"
)

func ValidateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}

	if len(email) > 254 {
		return errors.New("email address is too long")
	}

	_, err := mail.ParseAddress(email)
	if err != nil {
		return errors.New("email is invalid")
	}

	return nil
}
