package service_test

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/database"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository/postgres"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/utils"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) (*gorm.DB, *redis.Client) {
	// Load .env from project root if it exists
	_ = godotenv.Load("../../../.env")

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		t.Skip("Skipping integration test: DATABASE_URL not set")
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379" // Default local redis
	}

	db, err := database.NewPostgres()
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Important for stress tests against remote Postgres:
	// Limit max connections so we don't exceed NeonDB/Postgres limits
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetMaxIdleConns(10)
	}

	redisClient := database.NewRedisClient(redisAddr, os.Getenv("REDIS_PASSWORD"), 0)

	// Skip auto-migrate for remote DB to avoid Neon DB constraint errors
	// as the DB schema should already be set up by the application.

	return db, redisClient
}

func TestReservationConcurrencyStressTest(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping stress test in short mode.")
	}

	db, redisClient := setupTestDB(t)

	ctx := context.Background()

	// 1. Seed dependencies
	testPrefix := uuid.NewString()[:8]

	user := &domain.User{
		ID:           uuid.NewString(),
		Email:        fmt.Sprintf("test_user_%s@example.com", testPrefix),
		Username:     fmt.Sprintf("testuser_%s", testPrefix),
		PasswordHash: "hashed",
		Role:         domain.RoleUser,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	aircraft := &domain.Aircraft{
		ID:           uuid.NewString(),
		Registration: fmt.Sprintf("REG-%s", testPrefix),
		Model:        "TestAircraft",
		TotalSeats:   100,
		Status:       domain.AircraftActive,
	}

	airportOrigin := &domain.Airport{
		ID:      uuid.NewString(),
		Code:    fmt.Sprintf("O%s", testPrefix)[:3],
		Name:    "Origin Airport",
		City:    "OriginCity",
		Country: "Country",
	}

	airportDest := &domain.Airport{
		ID:      uuid.NewString(),
		Code:    fmt.Sprintf("D%s", testPrefix)[:3],
		Name:    "Dest Airport",
		City:    "DestCity",
		Country: "Country",
	}

	seat := &domain.Seat{
		ID:         uuid.NewString(),
		AircraftID: aircraft.ID,
		SeatNumber: "1A",
		Class:      domain.SeatEconomy,
	}

	flight := &domain.Flight{
		ID:                   uuid.NewString(),
		FlightNumber:         fmt.Sprintf("FL%s", testPrefix),
		AircraftID:           aircraft.ID,
		OriginAirportID:      airportOrigin.ID,
		DestinationAirportID: airportDest.ID,
		DepartureTime:        time.Now().Add(24 * time.Hour),
		ArrivalTime:          time.Now().Add(28 * time.Hour),
		Status:               domain.FlightScheduled,
	}

	flightSeat := &domain.FlightSeat{
		ID:        uuid.NewString(),
		FlightID:  flight.ID,
		SeatID:    seat.ID,
		Status:    domain.SeatAvailable,
		Price:     100,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Create in DB
	errs := []error{
		db.Omit("Role").Create(user).Error,
		db.Create(aircraft).Error,
		db.Create(airportOrigin).Error,
		db.Create(airportDest).Error,
		db.Create(seat).Error,
		db.Create(flight).Error,
		db.Create(flightSeat).Error,
	}

	for _, err := range errs {
		if err != nil {
			t.Fatalf("Failed to seed database: %v", err)
		}
	}

	// Setup teardown for DB seeded items
	defer func() {
		log.Println("Cleaning up seeded test data...")
		db.Where("flight_id = ?", flight.ID).Delete(&domain.Reservation{})
		db.Delete(flightSeat)
		db.Delete(flight)
		db.Delete(seat)
		db.Delete(airportOrigin)
		db.Delete(airportDest)
		db.Delete(aircraft)
		db.Delete(user)
	}()

	// 2. Setup Services
	resRepo := postgres.NewReservationRepository(db)
	flightRepo := postgres.NewFlightRepository(db)
	flightSeatRepo := postgres.NewFlightSeatRepository(db)
	userRepo := postgres.NewUserRepository(db)
	uow := postgres.NewGormUnitOfWork(db)

	reservationSvc := service.NewReservationService(
		resRepo,
		flightRepo,
		flightSeatRepo,
		userRepo,
		redisClient,
		uow,
	)

	// 3. Concurrency Test
	const numConcurrent = 10000

	var (
		successCount int32
		failureCount int32
		wg           sync.WaitGroup
		startBarrier sync.WaitGroup
	)

	wg.Add(numConcurrent)
	startBarrier.Add(1)

	log.Printf("Spawning %d concurrent reservation requests...", numConcurrent)
	for i := 0; i < numConcurrent; i++ {
		go func() {
			defer wg.Done()

			req := &dto.ReserveSeatRequest{
				UserID:       user.ID,
				FlightSeatID: flightSeat.ID,
			}

			// Wait for the barrier to release so all routines start together
			startBarrier.Wait()

			// Each needs its own context for isolated transactions/operations
			// Set a high timeout to accommodate 10,000 requests against a remote pooler
			reqCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
			defer cancel()

			_, err := reservationSvc.ReserveSeat(reqCtx, req)
			if err != nil {
				atomic.AddInt32(&failureCount, 1)
			} else {
				atomic.AddInt32(&successCount, 1)
			}
		}()
	}

	// Release the hounds! Start all goroutines at the exact same time
	log.Println("Releasing barrier for all requests...")
	startBarrier.Done()
	wg.Wait()
	log.Println("All requests completed.")

	// 4. Assertions
	if successCount != 1 {
		t.Errorf("Expected exactly 1 successful reservation, got %d", successCount)
	}

	if failureCount != numConcurrent-1 {
		t.Errorf("Expected exactly %d failed reservations, got %d", numConcurrent-1, failureCount)
	}

	// Verify DB state directly
	var reservations []domain.Reservation
	db.Where("flight_seat_id = ?", flightSeat.ID).Find(&reservations)

	if len(reservations) != 1 {
		t.Errorf("Expected exactly 1 reservation record in DB, found %d", len(reservations))
	} else {
		if reservations[0].Status != domain.ReservationPending {
			t.Errorf("Expected reservation status to be pending, got %s", reservations[0].Status)
		}
	}

	// Verify Seat state
	var updatedSeat domain.FlightSeat
	db.First(&updatedSeat, "id = ?", flightSeat.ID)

	if updatedSeat.Status != domain.SeatHeld {
		t.Errorf("Expected final seat status to be 'held', got %s", updatedSeat.Status)
	}

	// Verify Redis Lock
	key := utils.GenerateSeatHoldKey(flightSeat.ID)
	val, err := redisClient.Get(ctx, key).Result()
	if err != nil {
		t.Errorf("Expected redis lock to still exist (hold), but got err: %v", err)
	}
	if val != user.ID {
		t.Errorf("Expected redis lock value to be userID %s, got %s", user.ID, val)
	}

	// Cleanup Redis lock explicitly
	redisClient.Del(ctx, key)
}
