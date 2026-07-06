package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/joho/godotenv"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/configs"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/database"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/handlers"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/middleware"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/payment/razorpay"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/repository/postgres"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Fatal(err)
	}

	db, err := database.NewPostgres()
	if err != nil {
		log.Fatal("Could not connect to the database: " + err.Error())
	}

	log.Println("Connected to PostgreSQL")

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Could not connect to PostgreSQL: " + err.Error())
	}

	defer sqlDB.Close()

	gormUOW := postgres.NewGormUnitOfWork(db)

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	redisClient := database.NewRedisClient(
		cfg.RedisAddr,
		cfg.RedisPassword,
		cfg.RedisDB,
	)

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
		15*time.Minute,
	)

	ctx := context.Background()

	userRepo := postgres.NewUserRepository(db)
	userService := service.NewUserService(userRepo, jwtService)
	userHandler := handlers.NewUserHandler(userService)
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	airportRepo := postgres.NewAirportRepository(db)
	airportService := service.NewAirportService(airportRepo)
	airportHandler := handlers.NewAirportHandler(airportService)

	aircraftRepo := postgres.NewAircraftRepository(db)
	aircraftService := service.NewAircraftService(aircraftRepo)
	aircraftHandler := handlers.NewAircraftHandler(aircraftService)

	flightRepo := postgres.NewFlightRepository(db)
	flightService := service.NewFlightService(flightRepo, airportRepo, aircraftRepo)
	flightHandler := handlers.NewFlightHandler(flightService)

	seatRepo := postgres.NewSeatRepository(db)
	seatService := service.NewSeatService(seatRepo)
	seatHandler := handlers.NewSeatHandler(seatService)

	flightSeatRepo := postgres.NewFlightSeatRepository(db)
	flightSeatService := service.NewFlightSeatService(flightSeatRepo, seatRepo, flightRepo, redisClient)
	flightSeatHandler := handlers.NewFlightSeatHandler(flightSeatService)

	reservationRepo := postgres.NewReservationRepository(db)
	reservationService := service.NewReservationService(reservationRepo, flightRepo, flightSeatRepo, userRepo, redisClient, gormUOW)
	reservationHandler := handlers.NewReservationHandler(reservationService)

	paymentRepo := postgres.NewPaymentRepository(db)
	gateway := razorpay.NewGateway(
		cfg.RazorpayKeyID,
		cfg.RazorpayKeySecret,
	)

	paymentService := service.NewPaymentService(
		paymentRepo,
		reservationRepo,
		flightSeatRepo,
		gateway,
		cfg.RazorpayKeyID,
	)

	paymentHandler := handlers.NewPaymentHandler(paymentService)

	go reservationService.StartExpirationWorker(ctx)

	mux := newMux(userHandler, authMiddleware, airportHandler, aircraftHandler, flightHandler, seatHandler, flightSeatHandler, reservationHandler, paymentHandler)

	log.Println("Listening on port 8088")
	if err := http.ListenAndServe(":8088", mux); err != nil {
		log.Fatal(err)
	}
}

func newMux(
	userHandler *handlers.UserHandler,
	authMiddleware *middleware.AuthMiddleware,
	airportHandler *handlers.AirportHandler,
	aircraftHandler *handlers.AircraftHandler,
	flightHandler *handlers.FlightHandler,
	seatHandler *handlers.SeatHandler,
	flightSeatHandler *handlers.FlightSeatHandler,
	reservationHandler *handlers.ReservationHandler,
	paymentHandler *handlers.PaymentHandler,
) *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle(
		"GET /api/v1/users/me",
		authMiddleware.Authenticate(http.HandlerFunc(userHandler.Me)),
	)
	mux.HandleFunc("POST /api/v1/auth/register", userHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", userHandler.Login)
	registerAirportRoutes(mux, airportHandler)
	registerAircraftRoutes(mux, aircraftHandler)
	registerFlightRoutes(mux, flightHandler)
	registerSeatRoutes(mux, seatHandler)
	registerFlightSeatRoutes(mux, flightSeatHandler)
	registerReservationRoutes(mux, reservationHandler)
	registerPaymentRoutes(mux, paymentHandler)
	return mux
}

func registerAirportRoutes(mux *http.ServeMux, airportHandler *handlers.AirportHandler) {
	mux.HandleFunc("POST /api/v1/airports", airportHandler.CreateAirport)
	mux.HandleFunc("GET /api/v1/airports/code/{code}", airportHandler.GetAirportByCode)
	mux.HandleFunc("GET /api/v1/airports/{id}", airportHandler.GetAirportByID)
	mux.HandleFunc("PUT /api/v1/airports/{id}", airportHandler.UpdateAirportByID)
	mux.HandleFunc("DELETE /api/v1/airports/{id}", airportHandler.DeleteAirportByID)
}

func registerAircraftRoutes(mux *http.ServeMux, aircraftHandler *handlers.AircraftHandler) {
	mux.HandleFunc("POST /api/v1/aircrafts", aircraftHandler.CreateAircraft)
	mux.HandleFunc("GET /api/v1/aircrafts/registration/{registration}", aircraftHandler.GetAircraftByRegistration)
	mux.HandleFunc("GET /api/v1/aircrafts/{id}", aircraftHandler.GetAircraftByID)
	mux.HandleFunc("PUT /api/v1/aircrafts/{id}", aircraftHandler.UpdateAircraftByID)
	mux.HandleFunc("DELETE /api/v1/aircrafts/{id}", aircraftHandler.DeleteAircraftByID)
}

func registerFlightRoutes(mux *http.ServeMux, flightHandler *handlers.FlightHandler) {
	mux.HandleFunc("GET /api/v1/flights", flightHandler.ListFlights)
	mux.HandleFunc("POST /api/v1/flights", flightHandler.CreateFlight)
	mux.HandleFunc("GET /api/v1/flights/number/{flightNumber}", flightHandler.GetFlightByFlightNumber)
	mux.HandleFunc("GET /api/v1/flights/{id}", flightHandler.GetFlightByID)
	mux.HandleFunc("PUT /api/v1/flights/{id}", flightHandler.UpdateFlightByID)
	mux.HandleFunc("DELETE /api/v1/flights/{id}", flightHandler.DeleteFlightByID)
}

func registerSeatRoutes(mux *http.ServeMux, seatHandler *handlers.SeatHandler) {
	mux.HandleFunc("POST /api/v1/seats", seatHandler.CreateSeat)
	mux.HandleFunc("GET /api/v1/seats/{id}", seatHandler.GetSeatByID)
	mux.HandleFunc("GET /api/v1/seats/aircraft/{aircraftId}", seatHandler.GetSeatsByAircraftID)
	mux.HandleFunc("PUT /api/v1/seats/{id}", seatHandler.UpdateSeatByID)
	mux.HandleFunc("DELETE /api/v1/seats/{id}", seatHandler.DeleteSeatByID)
}

func registerFlightSeatRoutes(mux *http.ServeMux, flightSeatHandler *handlers.FlightSeatHandler) {
	mux.HandleFunc("POST /api/v1/flight-seats", flightSeatHandler.CreateFlightSeat)
	mux.HandleFunc("GET /api/v1/flight-seats/{id}", flightSeatHandler.GetFlightSeatByID)
	mux.HandleFunc("GET /api/v1/flight-seats/flight/{flightId}", flightSeatHandler.GetFlightSeatsByFlightID)
	mux.HandleFunc("PUT /api/v1/flight-seats/{id}", flightSeatHandler.UpdateFlightSeatByID)
	mux.HandleFunc("DELETE /api/v1/flight-seats/{id}", flightSeatHandler.DeleteFlightSeatByID)
	mux.HandleFunc(
		"POST /api/v1/flights/{flightId}/inventory",
		flightSeatHandler.GenerateFlightInventory,
	)
}

func registerReservationRoutes(mux *http.ServeMux, reservationHandler *handlers.ReservationHandler) {
	// Reservation lifecycle
	mux.HandleFunc("POST /api/v1/reservations/reserve", reservationHandler.ReserveSeat)
	mux.HandleFunc("POST /api/v1/reservations/{id}/confirm", reservationHandler.ConfirmReservation)
	mux.HandleFunc("DELETE /api/v1/reservations/{id}/user/{userId}", reservationHandler.CancelReservation)

	// Queries
	mux.HandleFunc("GET /api/v1/reservations", reservationHandler.ListReservations)
	mux.HandleFunc("GET /api/v1/reservations/{id}", reservationHandler.GetReservationByID)
	mux.HandleFunc("GET /api/v1/reservations/user/{userId}", reservationHandler.GetReservationsByUserID)
	mux.HandleFunc("GET /api/v1/reservations/flight/{flightId}", reservationHandler.GetReservationsByFlightID)
}

func registerPaymentRoutes(mux *http.ServeMux, paymentHandler *handlers.PaymentHandler) {
	mux.HandleFunc("POST /api/v1/payments", paymentHandler.CreatePayment)
}
