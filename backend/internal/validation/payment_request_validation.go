package validation

import (
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/payment"
)

func ValidateCreatePaymentRequest(req *payment.CreatePaymentRequest) error {
	if req == nil {
		return errs.ErrInvalidRequest
	}

	if err := ValidateReservationID(req.ReservationID); err != nil {
		return err
	}

	return nil
}
