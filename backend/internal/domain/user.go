package domain

import "time"

type User struct {
	ID              string    `gorm:"type:uuid;primaryKey" json:"id"`
	Email           string    `gorm:"uniqueIndex;not null" json:"email"`
	Username        string    `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash    string    `gorm:"column:password_hash;not null" json:"-"`
	PhoneNumber     string    `gorm:"column:phone_number" json:"phoneNumber"`
	ProfileImageURL string    `gorm:"column:profile_image_url" json:"profileImageUrl"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"column:updated_at" json:"updatedAt"`
}
