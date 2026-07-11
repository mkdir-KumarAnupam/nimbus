package dto

type CreateAircraftRequest struct {
	Registration string `json:"registration"`
	Model        string `json:"model"`
	TotalSeats   int    `json:"totalSeats"`
	Status       string `json:"status"`
}

type UpdateAircraftRequest struct {
	Model      string `json:"model"`
	TotalSeats int    `json:"totalSeats"`
	Status     string `json:"status"`
}

type AircraftResponse struct {
	ID           string `json:"id"`
	Registration string `json:"registration"`
	Model        string `json:"model"`
	TotalSeats   int    `json:"totalSeats"`
	Status       string `json:"status"`
}
