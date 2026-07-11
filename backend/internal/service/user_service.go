package service

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/errs"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository"
	validation2 "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/validation"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepository repository.UserRepository
	jwtService     *auth.JWTService
}

func NewUserService(userRepo repository.UserRepository, jwtService *auth.JWTService) *UserService {
	return &UserService{userRepository: userRepo, jwtService: jwtService}
}

func (s *UserService) Register(ctx context.Context, req *dto.RegisterRequest) error {

	//Normalization for validation
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Username = strings.TrimSpace(req.Username)

	//User details validation

	if err := validation2.ValidateEmail(req.Email); err != nil {
		return err
	}

	if err := validation2.ValidateUsername(req.Username); err != nil {
		return err
	}

	if err := validation2.ValidatePassword(req.Password); err != nil {
		return err
	}

	//Existing check
	existingUser, err := s.userRepository.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return err
	}

	if existingUser != nil {
		return errs.ErrEmailAlreadyExists
	}

	// Generate server-managed values
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	userID := uuid.NewString()
	now := time.Now()

	// Build the domain user
	user := &domain.User{
		ID:           userID,
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	return s.userRepository.CreateUser(ctx, user)
}

func (s *UserService) Login(ctx context.Context, req *dto.LoginRequest) (string, error) {
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if err := validation2.ValidateEmail(req.Email); err != nil {
		return "", err
	}

	if err := validation2.ValidatePassword(req.Password); err != nil {
		return "", err
	}

	user, err := s.userRepository.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return "", err
	}

	if user == nil {
		return "", errs.ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))

	if err != nil {
		return "", errs.ErrInvalidCredentials
	}

	token, err := s.jwtService.Generate(user)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *UserService) Me(ctx context.Context, userID string) (*domain.User, error) {
	user, err := s.userRepository.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errs.ErrUserNotFound
	}

	return user, nil
}
