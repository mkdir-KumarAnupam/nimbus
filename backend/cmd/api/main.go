package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/joho/godotenv"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/email"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/ratelimit"

	config "github.com/mkdir-KumarAnupam/airline-booking/backend/internal/configs"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/database"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/handlers"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/middleware"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/payment/razorpay"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/repository/postgres"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/service"
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

	redisLimiter := ratelimit.NewRedisLimiter(redisClient)
	rateLimitMiddleware := middleware.NewRateLimitMiddleware(redisLimiter)
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

	passengerRepo := postgres.NewPassengerRepository(db)
	passengerService := service.NewPassengerService(passengerRepo, reservationRepo)
	passengerHandler := handlers.NewPassengerHandler(passengerService)

	ticketRepo := postgres.NewTicketRepository(db)
	ticketService := service.NewTicketService(ticketRepo)
	ticketHandler := handlers.NewTicketHandler(ticketService)

	emailService := email.NewResendService(cfg.ResendAPIKey, cfg.EmailFrom)
	emailHandler := handlers.NewEmailHandler(emailService)

	bookingWorkflowService := service.NewBookingWorkflowService(
		gormUOW,
		reservationRepo,
		flightSeatRepo,
		flightRepo,
		passengerRepo,
		airportRepo,
		ticketRepo,
		reservationService,
		ticketService,
		emailService,
	)

	paymentRepo := postgres.NewPaymentRepository(db)
	gateway := razorpay.NewGateway(
		cfg.RazorpayKeyID,
		cfg.RazorpayKeySecret,
		cfg.RazorpayWebhookSecret,
	)

	refundRepo := postgres.NewRefundRepository(db)

	paymentService := service.NewPaymentService(
		paymentRepo,
		reservationRepo,
		flightSeatRepo,
		bookingWorkflowService,
		gateway,
		refundRepo,
		cfg.RazorpayKeyID,
	)

	paymentHandler := handlers.NewPaymentHandler(paymentService)

	go reservationService.StartExpirationWorker(ctx)

	savedPassengerRepo := postgres.NewSavedPassengerRepository(db)
	savedPassengerService := service.NewSavedPassengerService(savedPassengerRepo)
	savedPassengerHandler := handlers.NewSavedPassengerHandler(savedPassengerService)

	mux := newMux(
		userHandler,
		authMiddleware,
		rateLimitMiddleware,
		airportHandler,
		aircraftHandler,
		flightHandler,
		seatHandler,
		flightSeatHandler,
		reservationHandler,
		passengerHandler,
		paymentHandler,
		ticketHandler,
		savedPassengerHandler,
		emailHandler,
	)

	handler := middleware.CORS(mux)

	log.Println("Listening on port 8088")
	if err := http.ListenAndServe(":8088", handler); err != nil {
		log.Fatal(err)
	}
}

func newMux(
	userHandler *handlers.UserHandler,
	authMiddleware *middleware.AuthMiddleware,
	rateLimitMiddleware *middleware.RateLimitMiddleware,
	airportHandler *handlers.AirportHandler,
	aircraftHandler *handlers.AircraftHandler,
	flightHandler *handlers.FlightHandler,
	seatHandler *handlers.SeatHandler,
	flightSeatHandler *handlers.FlightSeatHandler,
	reservationHandler *handlers.ReservationHandler,
	passengerHandler *handlers.PassengerHandler,
	paymentHandler *handlers.PaymentHandler,
	ticketHandler *handlers.TicketHandler,
	savedPassengerHandler *handlers.SavedPassengerHandler,
	emailHandler *handlers.EmailHandler,
) *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle(
		"GET /api/v1/users/me",
		authMiddleware.Authenticate(http.HandlerFunc(userHandler.Me)),
	)

	mux.Handle(
		"GET /api/v1/users/me/saved-passengers",
		authMiddleware.Authenticate(http.HandlerFunc(savedPassengerHandler.GetSavedPassengers)),
	)
	mux.Handle(
		"POST /api/v1/users/me/saved-passengers",
		authMiddleware.Authenticate(http.HandlerFunc(savedPassengerHandler.CreateSavedPassenger)),
	)
	mux.Handle(
		"PUT /api/v1/users/me/saved-passengers/{id}",
		authMiddleware.Authenticate(http.HandlerFunc(savedPassengerHandler.UpdateSavedPassenger)),
	)
	mux.Handle(
		"DELETE /api/v1/users/me/saved-passengers/{id}",
		authMiddleware.Authenticate(http.HandlerFunc(savedPassengerHandler.DeleteSavedPassenger)),
	)

	mux.Handle(
		"POST /api/v1/auth/register",
		rateLimitMiddleware.Limit(
			"register",
			5,
			time.Minute,
		)(
			http.HandlerFunc(userHandler.Register),
		),
	)

	mux.Handle(
		"POST /api/v1/auth/login",
		rateLimitMiddleware.Limit(
			"login",
			5,
			time.Minute,
		)(
			http.HandlerFunc(userHandler.Login),
		),
	)

	registerAirportRoutes(mux, airportHandler)
	registerAircraftRoutes(mux, aircraftHandler)
	registerFlightRoutes(mux, flightHandler)
	registerSeatRoutes(mux, seatHandler)
	registerFlightSeatRoutes(mux, flightSeatHandler)
	registerReservationRoutes(mux, reservationHandler, rateLimitMiddleware, authMiddleware)
	registerPassengerRoutes(mux, passengerHandler)
	registerPaymentRoutes(mux, paymentHandler, rateLimitMiddleware, authMiddleware)
	registerTicketRoutes(mux, ticketHandler)
	registerEmailRoutes(mux, emailHandler)
	return mux
}

func registerAirportRoutes(mux *http.ServeMux, airportHandler *handlers.AirportHandler) {
	mux.HandleFunc("POST /api/v1/airports", airportHandler.CreateAirport)
	mux.HandleFunc("GET /api/v1/airports", airportHandler.ListAirports)
	mux.HandleFunc("GET /api/v1/airports/search", airportHandler.SearchAirports)
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
	mux.HandleFunc("POST /api/v1/flights/search", flightHandler.SearchFlights)
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

func registerReservationRoutes(mux *http.ServeMux, reservationHandler *handlers.ReservationHandler, ratelimitMiddleware *middleware.RateLimitMiddleware, authMiddlware *middleware.AuthMiddleware) {
	// Reservation lifecycle
	mux.Handle(
		"POST /api/v1/reservations/reserve",
		authMiddlware.Authenticate(
			ratelimitMiddleware.Limit(
				"reserve-seat",
				5,
				time.Minute*10,
			)(
				http.HandlerFunc(reservationHandler.ReserveSeat),
			),
		),
	)
	mux.HandleFunc("POST /api/v1/reservations/{id}/confirm", reservationHandler.ConfirmReservation)
	mux.HandleFunc("DELETE /api/v1/reservations/{id}/user/{userId}", reservationHandler.CancelReservation)

	// Queries
	mux.HandleFunc("GET /api/v1/reservations", reservationHandler.ListReservations)
	mux.HandleFunc("GET /api/v1/reservations/{id}", reservationHandler.GetReservationByID)
	mux.HandleFunc("GET /api/v1/reservations/user/{userId}", reservationHandler.GetReservationsByUserID)
	mux.HandleFunc("GET /api/v1/reservations/flight/{flightId}", reservationHandler.GetReservationsByFlightID)
}

func registerPassengerRoutes(mux *http.ServeMux, passengerHandler *handlers.PassengerHandler) {
	mux.HandleFunc("POST /api/v1/reservations/{reservationId}/passengers", passengerHandler.CreatePassenger)
	mux.HandleFunc("GET /api/v1/passengers/reservation/{reservationId}", passengerHandler.GetPassengersByReservationID)
	mux.HandleFunc("GET /api/v1/passengers/{id}", passengerHandler.GetPassengerByID)
	mux.HandleFunc("PUT /api/v1/passengers/{id}", passengerHandler.UpdatePassenger)
	mux.HandleFunc("DELETE /api/v1/passengers/{id}", passengerHandler.DeletePassenger)
}

func registerPaymentRoutes(
	mux *http.ServeMux,
	paymentHandler *handlers.PaymentHandler,
	ratelimitMiddleware *middleware.RateLimitMiddleware, authMiddlware *middleware.AuthMiddleware,
) {
	mux.Handle(
		"POST /api/v1/payments",
		authMiddlware.Authenticate(
			ratelimitMiddleware.Limit(
				"create-payment",
				5,
				time.Minute*10,
			)(
				http.HandlerFunc(paymentHandler.CreatePayment),
			),
		),
	)

	mux.Handle(
		"POST /api/v1/payments/refund",
		authMiddlware.Authenticate(
			ratelimitMiddleware.Limit(
				"refund-payment",
				5,
				time.Minute*10,
			)(
				http.HandlerFunc(paymentHandler.RequestRefund),
			),
		),
	)

	mux.HandleFunc(
		"POST /api/v1/payments/refund",
		paymentHandler.RequestRefund,
	)

	mux.HandleFunc(
		"POST /api/v1/payments/webhook",
		paymentHandler.Webhook,
	)

	mux.HandleFunc(
		"GET /api/v1/payments/reservation/{reservationId}",
		paymentHandler.GetPaymentSummary,
	)
}

func registerEmailRoutes(mux *http.ServeMux, emailhandler *handlers.EmailHandler) {
	mux.HandleFunc(
		"GET /api/v1/test/email",
		emailhandler.TestBookingEmail,
	)
}

func registerTicketRoutes(mux *http.ServeMux, ticketHandler *handlers.TicketHandler) {
	mux.HandleFunc("GET /api/v1/tickets", ticketHandler.ListTickets)
	mux.HandleFunc("GET /api/v1/tickets/{id}", ticketHandler.GetTicketByID)
	mux.HandleFunc("GET /api/v1/tickets/reservation/{reservationId}", ticketHandler.GetTicketByReservationID)
	mux.HandleFunc("GET /api/v1/tickets/number/{ticketNumber}", ticketHandler.GetTicketByTicketNumber)
	mux.HandleFunc("GET /api/v1/tickets/user/{userId}", ticketHandler.GetTicketsByUserID)
}
