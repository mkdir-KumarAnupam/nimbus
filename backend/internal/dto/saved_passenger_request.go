package dto

type SavedPassengerRequest struct {
	FirstName           string     `json:"firstName" validate:"required"`
	LastName            string     `json:"lastName" validate:"required"`
	Gender              string     `json:"gender" validate:"required"`
	DateOfBirth         string     `json:"dateOfBirth" validate:"required"` // Expect ISO8601 string
	Nationality         string     `json:"nationality" validate:"required"`
	Email               string     `json:"email" validate:"required,email"`
	Phone               string     `json:"phone" validate:"required"`
	PassportNumber      *string    `json:"passportNumber"`
	PassportExpiry      *string    `json:"passportExpiry"` // Expect ISO8601 string
	PassportCountry     *string    `json:"passportCountry"`
	MealPreference      *string    `json:"mealPreference"`
	SpecialAssistance   *string    `json:"specialAssistance"`
	FrequentFlyerNumber *string    `json:"frequentFlyerNumber"`
}
