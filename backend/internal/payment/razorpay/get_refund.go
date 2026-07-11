package razorpay

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/payment"
)

type refundDetailsResponse struct {
	ID        string `json:"id"`
	PaymentID string `json:"payment_id"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Status    string `json:"status"`
}

func (g *Gateway) GetRefund(
	ctx context.Context,
	refundID string,
) (*payment.RefundDetails, error) {
	refundURL := fmt.Sprintf(
		"https://api.razorpay.com/v1/refunds/%s",
		refundID,
	)

	//GET Request

	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		refundURL,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	//Authenticate
	request.SetBasicAuth(g.keyID, g.keySecret)

	response, err := g.client.Do(request)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to send refund lookup request: %w",
			err,
		)
	}

	defer response.Body.Close()
	bodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf(
			"razorpay API returned %d: %s",
			response.StatusCode,
			string(bodyBytes),
		)
	}

	var razorpayResp refundDetailsResponse

	if err := json.Unmarshal(bodyBytes, &razorpayResp); err != nil {
		return nil, fmt.Errorf(
			"failed to decode refund response: %w",
			err,
		)
	}

	return &payment.RefundDetails{
		ID:        razorpayResp.ID,
		PaymentID: razorpayResp.PaymentID,
		Amount:    razorpayResp.Amount,
		Currency:  razorpayResp.Currency,
		Status:    razorpayResp.Status,
	}, nil
}
