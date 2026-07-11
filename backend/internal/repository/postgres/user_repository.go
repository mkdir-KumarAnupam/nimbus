package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, user *domain.User) error {
	result := r.db.WithContext(ctx).Create(user)
	return result.Error
}

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User

	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error //WHERE id is the passing argument
	if errors.Is(err, gorm.ErrRecordNotFound) {

		return nil, nil

	}
	if err != nil {
		return nil, err
	}

	return &user, nil

}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {

	var user domain.User
	err := r.db.WithContext(ctx).
		First(&user, "email = ?", email).
		Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil

}

func (r *UserRepository) UpdateUser(ctx context.Context, user *domain.User) error {
	result := r.db.WithContext(ctx).Model(&domain.User{}).Where("id = ?", user.ID).Updates(user).Error
	return result
}

func (r *UserRepository) DeleteUser(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&domain.User{}, "id = ?", id).Error
	return result
}
