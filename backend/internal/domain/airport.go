package domain

type Airport struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	Code string `gorm:"column:airport_code;size:3;uniqueIndex;not null" json:"code"`
	Name string `gorm:"column:airport_name;not null" json:"name"`

	City     string `gorm:"column:airport_city;not null" json:"city"`
	Country  string `gorm:"column:airport_country;not null" json:"country"`
	Timezone string `gorm:"column:timezone;not null" json:"timezone"`
}
