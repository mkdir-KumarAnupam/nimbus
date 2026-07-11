package validation

import (
	"strings"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/payment"
)

func ValidatePaymentID(id string) error {
	if strings.TrimSpace(id) == "" {
		return errs.ErrInvalidPaymentID
	}

	return nil
}

func ValidateRequestRefundRequest(
	request *payment.RequestRefundRequest,
) error {
	if request == nil {
		return errs.ErrInvalidRequest
	}

	if err := ValidatePaymentID(request.PaymentID); err != nil {
		return err
	}

	if err := ValidateRefundReason(request.Reason); err != nil {
		return err
	}

	return nil
}

func ValidateRefundID(id string) error {
	if strings.TrimSpace(id) == "" {
		return errs.ErrInvalidRefundID
	}

	return nil
}

func ValidateGatewayRefundID(id string) error {
	if strings.TrimSpace(id) == "" {
		return errs.ErrInvalidGatewayRefundID
	}

	return nil
}

func ValidateRefundReason(reason domain.RefundReason) error {
	switch reason {
	case domain.RefundReasonBookingFailure,
		domain.RefundReasonCustomerCancellation:
		return nil

	default:
		return errs.ErrInvalidRefundReason
	}
}

func ValidateRefundStatus(status domain.RefundStatus) error {
	switch status {
	case domain.RefundPending,
		domain.RefundSucceeded,
		domain.RefundFailed:
		return nil

	default:
		return errs.ErrInvalidRefundStatus
	}
}
