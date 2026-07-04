package validation

import (
	"errors"
	"strings"
)

func ValidatePassword(password string) error {
	if password == "" {
		return errors.New("password is required")
	}

	if password != strings.TrimSpace(password) {
		return errors.New("password cannot start or end with whitespace")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	if len(password) > 72 {
		return errors.New("password cannot exceed 72 characters")
	}

	return nil
}
