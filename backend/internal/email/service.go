package email

import "context"

type BookingConfirmationData struct {
	ToEmail       string
	PassengerName string
	PNR           string
	FlightNumber  string
	FromAirport   string
	ToAirport     string
	DepartureTime string
	ArrivalTime   string
	SeatNumber    string
	TicketNumber  string
}

type BookingCancellationData struct {
	ToEmail string

	PassengerName string

	PNR string

	FlightNumber string

	FromAirport string
	ToAirport   string

	DepartureTime string
	ArrivalTime   string

	SeatNumber string

	TicketNumber string
}

type Service interface {
	SendBookingConfirmation(
		ctx context.Context,
		data BookingConfirmationData,
	) error

	SendBookingCancellation(
		ctx context.Context,
		data BookingCancellationData,
	) error
}
