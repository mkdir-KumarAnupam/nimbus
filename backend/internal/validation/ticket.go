package validation

import (
	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
)

func ValidateTicketID(ticketID string) error {
	if ticketID == "" {
		return errs.ErrTicketIDRequired
	}

	if _, err := uuid.Parse(ticketID); err != nil {
		return errs.ErrTicketIDInvalid
	}

	return nil
}

func ValidateTicketNumber(ticketNumber string) error {
	if ticketNumber == "" {
		return errs.ErrTicketNumberRequired
	}

	return nil
}
