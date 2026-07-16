package email

import (
	"bytes"
	"context"
	_ "embed"
	"html/template"

	"github.com/resend/resend-go/v2"
)

//go:embed template/booking.html
var bookingTemplateHTML string

type ResendService struct {
	client *resend.Client
	from   string
}

func NewResendService(apiKey, from string) *ResendService {
	return &ResendService{
		client: resend.NewClient(apiKey),
		from:   from,
	}
}

func (s *ResendService) SendBookingConfirmation(
	ctx context.Context,
	data BookingConfirmationData,
) error {
	tmpl, err := template.New("booking").Parse(bookingTemplateHTML)
	if err != nil {
		return err
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return err
	}

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{data.ToEmail},
		Subject: "Your Nimbus Airways Booking is Confirmed ✈️",
		Html:    body.String(),
	}

	_, err = s.client.Emails.Send(params)
	return err
}

func (s *ResendService) SendBookingCancellation(
	ctx context.Context,
	data BookingCancellationData,
) error {

	tmpl, err := template.New("cancellation").Parse(cancellationTemplateHTML)
	if err != nil {
		return err
	}

	var body bytes.Buffer

	if err := tmpl.Execute(&body, data); err != nil {
		return err
	}

	params := &resend.SendEmailRequest{
		From: s.from,
		To: []string{
			data.ToEmail,
		},
		Subject: "Your Nimbus Airways Booking Has Been Cancelled",
		Html:    body.String(),
	}

	_, err = s.client.Emails.Send(params)
	return err
}
