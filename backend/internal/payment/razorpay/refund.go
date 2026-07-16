package razorpay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	payment2 "github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
)

type refundRequest struct {
	Amount int64 `json:"amount,omitempty"`
}

type refundResponse struct {
	ID        string `json:"id"`
	PaymentID string `json:"payment_id"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Status    string `json:"status"`
}

func (g *Gateway) RefundPayment(
	ctx context.Context,
	req payment2.RefundRequest,
) (*payment2.RefundResponse, error) {
	url := fmt.Sprintf(
		"https://api.razorpay.com/v1/payments/%s/refund",
		req.PaymentID,
	)

	razorReq := refundRequest{
		Amount: req.Amount,
	}

	//Marshal the request into a json
	body, err := json.Marshal(razorReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal refund request: %w", err)
	}

	//Create a request
	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		url,
		bytes.NewReader(body), //Convert it to bytes for http
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create refund request: %w", err)
	}

	//Set the request headers
	request.Header.Set(
		"Content-Type",
		"application/json",
	)

	//Set the request auth
	request.SetBasicAuth(
		g.keyID,
		g.keySecret,
	)

	//send the request
	response, err := g.client.Do(request)
	if err != nil {
		return nil, fmt.Errorf("failed to send refund request: %w", err)
	}

	//dont forget to close the response
	defer response.Body.Close()

	//Read the received response
	bodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check whether Razorpay returned a successful status code.
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf(
			"razorpay API returned %d: %s",
			response.StatusCode,
			string(bodyBytes),
		)
	}

	//Unmarshal the response into refund response
	var razorResp refundResponse

	if err := json.Unmarshal(bodyBytes, &razorResp); err != nil {
		return nil, fmt.Errorf(
			"failed to decode refund response: %w",
			err,
		)
	}

	return &payment2.RefundResponse{
		RefundID:  razorResp.ID,
		PaymentID: razorResp.PaymentID,
		Amount:    razorResp.Amount,
		Currency:  razorResp.Currency,
		Status:    razorResp.Status,
	}, nil
}
