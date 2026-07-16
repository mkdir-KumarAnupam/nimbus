package dto

import "time"

type SavedPassengerResponse struct {
	ID                  string     `json:"id"`
	UserID              string     `json:"userId"`
	FirstName           string     `json:"firstName"`
	LastName            string     `json:"lastName"`
	Gender              string     `json:"gender"`
	DateOfBirth         time.Time  `json:"dateOfBirth"`
	Nationality         string     `json:"nationality"`
	Email               string     `json:"email"`
	Phone               string     `json:"phone"`
	PassportNumber      *string    `json:"passportNumber,omitempty"`
	PassportExpiry      *time.Time `json:"passportExpiry,omitempty"`
	PassportCountry     *string    `json:"passportCountry,omitempty"`
	MealPreference      *string    `json:"mealPreference,omitempty"`
	SpecialAssistance   *string    `json:"specialAssistance,omitempty"`
	FrequentFlyerNumber *string    `json:"frequentFlyerNumber,omitempty"`
	CreatedAt           time.Time  `json:"createdAt"`
	UpdatedAt           time.Time  `json:"updatedAt"`
}
