package handlers

import (
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/email"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/response"
)

type EmailHandler struct {
	emailService email.Service
}

func NewEmailHandler(emailService email.Service) *EmailHandler {
	return &EmailHandler{
		emailService: emailService,
	}
}

func (h *EmailHandler) TestBookingEmail(w http.ResponseWriter, r *http.Request) {
	err := h.emailService.SendBookingConfirmation(
		r.Context(),
		email.BookingConfirmationData{
			ToEmail:       "kranupam101@gmail.com",
			PassengerName: "Anupam Kumar",
			PNR:           "NB7X2F",
			FlightNumber:  "AG504",
			FromAirport:   "DEL",
			ToAirport:     "BOM",
			DepartureTime: "15 Jul 2026 19:30",
			ArrivalTime:   "15 Jul 2026 21:50",
			SeatNumber:    "1A",
			TicketNumber:  "NB2507150001",
		},
	)

	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "Email sent successfully",
	})
}
