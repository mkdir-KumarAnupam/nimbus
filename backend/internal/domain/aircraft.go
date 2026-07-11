package domain

type AircraftStatus string

const (
	AircraftActive      AircraftStatus = "active"
	AircraftMaintenance AircraftStatus = "maintenance"
	AircraftRetired     AircraftStatus = "retired"
)

type Aircraft struct {
	ID string `gorm:"type:uuid;primaryKey" json:"id"`

	Registration string `gorm:"uniqueIndex;not null" json:"registration"`
	Model        string `gorm:"not null" json:"model"`
	TotalSeats   int    `gorm:"not null" json:"totalSeats"`

	Status AircraftStatus `gorm:"type:text;not null" json:"status"`
}

func (Aircraft) TableName() string {
	return "aircraft"
}
