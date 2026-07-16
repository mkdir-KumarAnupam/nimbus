package domain

import "time"

type SavedPassenger struct {
	ID                  string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID              string     `gorm:"type:uuid;not null;index" json:"userId"`
	FirstName           string     `gorm:"column:first_name;not null" json:"firstName"`
	LastName            string     `gorm:"column:last_name;not null" json:"lastName"`
	Gender              string     `gorm:"column:gender;not null" json:"gender"`
	DateOfBirth         time.Time  `gorm:"column:date_of_birth;not null" json:"dateOfBirth"`
	Nationality         string     `gorm:"column:nationality;not null" json:"nationality"`
	Email               string     `gorm:"column:email;not null" json:"email"`
	Phone               string     `gorm:"column:phone;not null" json:"phone"`
	PassportNumber      *string    `gorm:"column:passport_number" json:"passportNumber,omitempty"`
	PassportExpiry      *time.Time `gorm:"column:passport_expiry" json:"passportExpiry,omitempty"`
	PassportCountry     *string    `gorm:"column:passport_country" json:"passportCountry,omitempty"`
	MealPreference      *string    `gorm:"column:meal_preference" json:"mealPreference,omitempty"`
	SpecialAssistance   *string    `gorm:"column:special_assistance" json:"specialAssistance,omitempty"`
	FrequentFlyerNumber *string    `gorm:"column:frequent_flyer_number" json:"frequentFlyerNumber,omitempty"`
	CreatedAt           time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt           time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}
