package postgres

import (
	"context"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/uow"
	"gorm.io/gorm"
)

type GormUnitOfWork struct {
	db *gorm.DB
}

func NewGormUnitOfWork(db *gorm.DB) *GormUnitOfWork {
	return &GormUnitOfWork{
		db: db,
	}
}

func (u *GormUnitOfWork) Do(
	ctx context.Context,
	fn func(uow.Repositories) error,
) error {

	tx := u.db.WithContext(ctx).Begin()
	if err := tx.Error; err != nil {
		return err
	}

	defer func() {
		if r := recover(); r != nil {
			_ = tx.Rollback().Error
			panic(r)
		}
	}()

	repos := uow.Repositories{
		Reservation: NewReservationRepository(tx),
		FlightSeat:  NewFlightSeatRepository(tx),
	}

	if err := fn(repos); err != nil {
		_ = tx.Rollback().Error
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
