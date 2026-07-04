package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/database"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/handlers"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/middleware"
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

	log.Println("Connected to database")

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal(err)
	}

	defer sqlDB.Close()

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable not set")
	}

	jwtService := auth.NewJWTService(jwtSecret, 15*time.Minute)

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

	mux := newMux(userHandler, authMiddleware, airportHandler, aircraftHandler, flightHandler)

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
