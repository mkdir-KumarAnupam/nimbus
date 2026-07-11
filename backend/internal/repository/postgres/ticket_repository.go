package postgres

import (
	"context"
	"errors"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/domain"
	"gorm.io/gorm"
)

type TicketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) *TicketRepository {
	return &TicketRepository{
		db: db,
	}
}

func (repo *TicketRepository) CreateTicket(
	ctx context.Context,
	ticket *domain.Ticket,
) error {
	return repo.db.WithContext(ctx).Create(ticket).Error
}

func (repo *TicketRepository) GetTicketByID(
	ctx context.Context,
	id string,
) (*domain.Ticket, error) {

	var ticket domain.Ticket

	err := repo.db.WithContext(ctx).
		Where("id = ?", id).
		First(&ticket).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &ticket, nil
}

func (repo *TicketRepository) GetTicketByReservationID(
	ctx context.Context,
	reservationID string,
) (*domain.Ticket, error) {

	var ticket domain.Ticket

	err := repo.db.WithContext(ctx).
		Where("reservation_id = ?", reservationID).
		First(&ticket).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &ticket, nil
}

func (repo *TicketRepository) GetTicketByTicketNumber(
	ctx context.Context,
	ticketNumber string,
) (*domain.Ticket, error) {

	var ticket domain.Ticket

	err := repo.db.WithContext(ctx).
		Where("ticket_number = ?", ticketNumber).
		First(&ticket).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &ticket, nil
}

func (repo *TicketRepository) UpdateTicket(
	ctx context.Context,
	ticket *domain.Ticket,
) error {
	return repo.db.WithContext(ctx).Save(ticket).Error
}

func (repo *TicketRepository) GetTicketsByUserID(
	ctx context.Context,
	userID string,
) ([]*domain.Ticket, error) {

	var tickets []*domain.Ticket

	err := repo.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&tickets).Error
	if err != nil {
		return nil, err
	}

	return tickets, nil
}

func (repo *TicketRepository) ListTickets(
	ctx context.Context,
) ([]*domain.Ticket, error) {

	var tickets []*domain.Ticket

	err := repo.db.WithContext(ctx).
		Find(&tickets).Error
	if err != nil {
		return nil, err
	}

	return tickets, nil
}
