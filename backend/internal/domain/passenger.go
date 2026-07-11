package domain

import "time"

type Passenger struct {
	ID                  string     `gorm:"type:uuid;primaryKey" json:"id"`
	ReservationID       string     `gorm:"type:uuid;not null;index" json:"reservationId"`
	FirstName           string     `gorm:"column:first_name;not null" json:"firstName"`
	LastName            string     `gorm:"column:last_name;not null" json:"lastName"`
	Gender              string     `gorm:"column:gender;not null" json:"gender"`
	DateOfBirth         time.Time  `gorm:"column:date_of_birth;not null" json:"dateOfBirth"`
	Nationality         string     `gorm:"column:nationality;not null" json:"nationality"`
	Email               string     `gorm:"column:email;not null" json:"email"`
	Phone               string     `gorm:"column:phone;not null" json:"phone"`
	PassportNumber      *string    `gorm:"column:passport_number" json:"passportNumber"`
	PassportExpiry      *time.Time `gorm:"column:passport_expiry" json:"passportExpiry"`
	PassportCountry     *string    `gorm:"column:passport_country" json:"passportCountry"`
	MealPreference      *string    `gorm:"column:meal_preference" json:"mealPreference"`
	SpecialAssistance   *string    `gorm:"column:special_assistance" json:"specialAssistance"`
	FrequentFlyerNumber *string    `gorm:"column:frequent_flyer_number" json:"frequentFlyerNumber"`
	CreatedAt           time.Time  `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt           time.Time  `gorm:"column:updated_at" json:"updatedAt"`
}
