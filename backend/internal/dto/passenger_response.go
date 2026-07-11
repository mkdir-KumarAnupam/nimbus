package dto

import "time"

type PassengerResponse struct {
	ID                  string     `json:"id"`
	ReservationID       string     `json:"reservationId"`
	FirstName           string     `json:"firstName"`
	LastName            string     `json:"lastName"`
	Gender              string     `json:"gender"`
	DateOfBirth         time.Time  `json:"dateOfBirth"`
	Nationality         string     `json:"nationality"`
	Email               string     `json:"email"`
	Phone               string     `json:"phone"`
	PassportNumber      *string    `json:"passportNumber"`
	PassportExpiry      *time.Time `json:"passportExpiry"`
	PassportCountry     *string    `json:"passportCountry"`
	MealPreference      *string    `json:"mealPreference"`
	SpecialAssistance   *string    `json:"specialAssistance"`
	FrequentFlyerNumber *string    `json:"frequentFlyerNumber"`
	CreatedAt           time.Time  `json:"createdAt"`
	UpdatedAt           time.Time  `json:"updatedAt"`
}
