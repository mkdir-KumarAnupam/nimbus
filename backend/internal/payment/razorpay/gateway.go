package razorpay

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
	payment2 "github.com/mkdir-KumarAnupam/airline-booking/internal/payment"
)

type Gateway struct {
	keyID     string
	keySecret string

	webhookSecret string
	client        *http.Client
}

func NewGateway(
	keyID string,
	keySecret string,
	webhookSecret string,
) *Gateway {
	return &Gateway{
		keyID:     keyID,
		keySecret: keySecret,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		webhookSecret: webhookSecret,
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

func (g *Gateway) CreateOrder(ctx context.Context, req payment2.CreateOrderRequest) (*payment2.CreateOrderResponse, error) {
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

	if err := json.Unmarshal(bodyBytes, &razorpayResp); err != nil {
		return nil, err
	}

	return &payment2.CreateOrderResponse{
		OrderID:  razorpayResp.ID,
		Amount:   razorpayResp.Amount,
		Currency: razorpayResp.Currency,
	}, nil
}

func (g *Gateway) VerifyWebhookSignature(
	body []byte,
	signature string,
) error {
	mac := hmac.New(sha256.New, []byte(g.webhookSecret)) //Mac Calculator

	_, err := mac.Write(body)
	if err != nil {
		return err
	}

	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal(
		[]byte(expectedSignature),
		[]byte(signature),
	) {
		return errs.ErrInvalidWebhookSignature
	}

	return nil
}

func (g *Gateway) GetPayment(ctx context.Context, paymentID string) (*payment2.PaymentDetails, error) {
	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("https://api.razorpay.com/v1/payments/%s", paymentID),
		nil,
	)

	if err != nil {
		return nil, err
	}

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
			"razorpay API returned %d: %s", response.StatusCode, string(bodyBytes))
	}

	var razorpayResp payment2.PaymentDetails
	if err := json.Unmarshal(bodyBytes, &razorpayResp); err != nil {
		return nil, err
	}

	return &payment2.PaymentDetails{
		ID:       razorpayResp.ID,
		OrderID:  razorpayResp.OrderID,
		Amount:   razorpayResp.Amount,
		Currency: razorpayResp.Currency,
		Status:   razorpayResp.Status,
	}, nil
}
