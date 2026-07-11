package dto

type CreateSeatRequest struct {
	AircraftID string `json:"aircraftId"`
	SeatNumber string `json:"seatNumber"`
	Class      string `json:"class"`
}

type UpdateSeatRequest struct {
	Class string `json:"class"`
}

type SeatResponse struct {
	ID         string `json:"id"`
	AircraftID string `json:"aircraftId"`
	SeatNumber string `json:"seatNumber"`
	Class      string `json:"class"`
}
