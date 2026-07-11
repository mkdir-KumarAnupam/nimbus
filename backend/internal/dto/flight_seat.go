package dto

type CreateFlightSeatRequest struct {
	FlightID string `json:"flightId"`
	SeatID   string `json:"seatId"`
	Status   string `json:"status"`
	Price    int64  `json:"price"`
}

type UpdateFlightSeatRequest struct {
	Status string `json:"status"`
	Price  int64  `json:"price"`
}

type FlightSeatResponse struct {
	ID string `json:"id"`

	FlightID string `json:"flightId"`
	SeatID   string `json:"seatId"`

	SeatNumber string `json:"seatNumber"`
	Class      string `json:"class"`

	Status string `json:"status"`
	Price  int64  `json:"price"`
}
