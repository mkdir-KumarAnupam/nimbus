package razorpay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
)

type Gateway struct {
	keyID     string
	keySecret string

	client *http.Client
}

func NewGateway(
	keyID string,
	keySecret string,
) *Gateway {
	return &Gateway{
		keyID:     keyID,
		keySecret: keySecret,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type createOrderRequest struct {
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
	Receipt  string `json:"receipt"`
}

type createOrderResponse struct {
	ID       string `json:"id"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
}

func (g *Gateway) CreateOrder(ctx context.Context, req payment.CreateOrderRequest) (*payment.CreateOrderResponse, error) {
	razorPayReq := createOrderRequest{
		Amount:   req.Amount,
		Currency: req.Currency,
		Receipt:  req.Receipt,
	}

	body, err := json.Marshal(razorPayReq)
	if err != nil {
		return nil, err
	}

	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		"https://api.razorpay.com/v1/orders",
		bytes.NewReader(body),
	)

	if err != nil {
		return nil, err
	}

	request.Header.Set(
		"Content-Type",
		"application/json",
	)

	request.SetBasicAuth(g.keyID, g.keySecret)

	response, err := g.client.Do(request)
	if err != nil {
		return nil, err
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

	var razorpayResp createOrderResponse
	if err = json.NewDecoder(response.Body).Decode(&razorpayResp); err != nil {
		return nil, err
	}

	return &payment.CreateOrderResponse{
		OrderID:  razorpayResp.ID,
		Amount:   razorpayResp.Amount,
		Currency: razorpayResp.Currency,
	}, nil
}
