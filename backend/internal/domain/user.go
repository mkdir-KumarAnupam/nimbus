package domain

import "time"

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID              string    `gorm:"type:uuid;primaryKey" json:"id"`
	Email           string    `gorm:"uniqueIndex;not null" json:"email"`
	Username        string    `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash    string    `gorm:"column:password_hash;not null" json:"-"`
	PhoneNumber     string    `gorm:"column:phone_number" json:"phoneNumber"`
	ProfileImageURL string    `gorm:"column:profile_image_url" json:"profileImageUrl"`
	Role            Role      `gorm:"type:varchar(20);default:'USER';not null"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"column:updated_at" json:"updatedAt"`
}
