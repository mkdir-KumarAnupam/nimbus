package validation

import (
	"errors"
	"unicode"
)

func ValidateUsername(username string) error {
	if username == "" {
		return errors.New("username is required")
	}

	if len(username) < 3 {
		return errors.New("username must be at least 3 characters")
	}

	if len(username) > 30 {
		return errors.New("username cannot exceed 30 characters")
	}

	for _, r := range username {
		if unicode.IsLetter(r) ||
			unicode.IsDigit(r) ||
			r == '_' ||
			r == '.' {
			continue
		}

		return errors.New("username contains invalid characters")
	}

	return nil
}
