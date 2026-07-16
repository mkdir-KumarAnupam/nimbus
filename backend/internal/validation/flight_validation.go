package validation

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	dto2 "github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/errs"
)

func ValidateFlightNumber(flightNumber string) error {
	flightNumber = strings.TrimSpace(flightNumber)

	if flightNumber == "" {
		return errors.New("flight number cannot be empty")
	}

	if len(flightNumber) > 10 {
		return errors.New("flight number is too long")
	}

	if flightNumber != strings.ToUpper(flightNumber) {
		return errors.New("flight number must be uppercase")
	}

	for _, r := range flightNumber {
		switch {
		case r >= 'A' && r <= 'Z':
		case r >= '0' && r <= '9':
		case r == '-':
		default:
			return errors.New("flight number must contain only letters, numbers, or hyphens")
		}
	}

	return nil
}

func ValidateFlightID(flightID string) error {
	if strings.TrimSpace(flightID) == "" {
		return errors.New("flight id cannot be empty")
	}

	if _, err := uuid.Parse(flightID); err != nil {
		return errors.New("flight id must be a valid uuid")
	}

	return nil
}

func ValidateFlightAircraftID(aircraftID string) error {
	if strings.TrimSpace(aircraftID) == "" {
		return errors.New("aircraft id cannot be empty")
	}

	if _, err := uuid.Parse(aircraftID); err != nil {
		return errors.New("aircraft id must be a valid uuid")
	}

	return nil
}

func ValidateFlightAirportID(airportID string) error {
	if strings.TrimSpace(airportID) == "" {
		return errors.New("airport id cannot be empty")
	}

	if _, err := uuid.Parse(airportID); err != nil {
		return errors.New("airport id must be a valid uuid")
	}

	return nil
}

func ValidateFlightRoute(originAirportID, destinationAirportID string) error {
	if strings.TrimSpace(originAirportID) == "" {
		return errors.New("origin airport id cannot be empty")
	}

	if strings.TrimSpace(destinationAirportID) == "" {
		return errors.New("destination airport id cannot be empty")
	}

	if originAirportID == destinationAirportID {
		return errors.New("origin and destination airports cannot be the same")
	}

	return nil
}

func ValidateFlightDepartureTime(departureTime time.Time) error {
	if departureTime.IsZero() {
		return errors.New("departure time cannot be empty")
	}

	if departureTime.Before(time.Now().UTC()) {
		return errors.New("departure time must be in the future")
	}

	return nil
}

func ValidateFlightArrivalTime(departureTime, arrivalTime time.Time) error {
	if arrivalTime.IsZero() {
		return errors.New("arrival time cannot be empty")
	}

	if arrivalTime.Before(departureTime) || arrivalTime.Equal(departureTime) {
		return errors.New("arrival time must be after departure time")
	}

	if arrivalTime.Before(time.Now().UTC()) {
		return errors.New("arrival time must be in the future")
	}

	return nil
}

func ValidateFlightStatus(status string) error {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case string(domain.FlightScheduled),
		string(domain.FlightBoarding),
		string(domain.FlightDelayed),
		string(domain.FlightDeparted),
		string(domain.FlightLanded),
		string(domain.FlightCancelled):
		return nil
	default:
		return errors.New("invalid flight status")
	}
}

func ValidateFlightSearchRequest(request *dto2.FlightSearchRequest) error {

	switch request.CabinClass {
	case "",
		domain.CabinEconomy,
		domain.CabinPremium,
		domain.CabinBusiness,
		domain.CabinFirst:
		// valid
	default:
		return errs.ErrInvalidCabinClass
	}


	if request.Passengers == 0 {
		return errors.New("passengers cannot be empty")
	}

	if request.DepartureAirportCode == "" {
		return errors.New("from cannot be empty")
	}

	if request.ArrivalAirportCode == "" {
		return errors.New("to cannot be empty")
	}

	if request.DepartureDate.IsZero() {
		return errors.New("date cannot be empty")
	}

	if request.DepartureDate.Before(time.Now().UTC()) {
		return errors.New("date cannot be in the past")
	}

	return nil
}

func ValidateCreateFlightRequest(req *dto2.CreateFlightRequest) error {
	req.FlightNumber = strings.ToUpper(strings.TrimSpace(req.FlightNumber))
	req.AircraftID = strings.TrimSpace(req.AircraftID)
	req.OriginAirportID = strings.TrimSpace(req.OriginAirportID)
	req.DestinationAirportID = strings.TrimSpace(req.DestinationAirportID)

	if err := ValidateFlightNumber(req.FlightNumber); err != nil {
		return err
	}

	if err := ValidateFlightAircraftID(req.AircraftID); err != nil {
		return err
	}

	if err := ValidateFlightAirportID(req.OriginAirportID); err != nil {
		return err
	}

	if err := ValidateFlightAirportID(req.DestinationAirportID); err != nil {
		return err
	}

	if err := ValidateFlightRoute(req.OriginAirportID, req.DestinationAirportID); err != nil {
		return err
	}

	if err := ValidateFlightDepartureTime(req.DepartureTime); err != nil {
		return err
	}

	if err := ValidateFlightArrivalTime(req.DepartureTime, req.ArrivalTime); err != nil {
		return err
	}

	return nil
}

func ValidateUpdateFlightRequest(req *dto2.UpdateFlightRequest) error {
	req.AircraftID = strings.TrimSpace(req.AircraftID)
	req.OriginAirportID = strings.TrimSpace(req.OriginAirportID)
	req.DestinationAirportID = strings.TrimSpace(req.DestinationAirportID)
	req.Status = strings.ToLower(strings.TrimSpace(req.Status))

	if err := ValidateFlightAircraftID(req.AircraftID); err != nil {
		return err
	}

	if err := ValidateFlightAirportID(req.OriginAirportID); err != nil {
		return err
	}

	if err := ValidateFlightAirportID(req.DestinationAirportID); err != nil {
		return err
	}

	if err := ValidateFlightRoute(req.OriginAirportID, req.DestinationAirportID); err != nil {
		return err
	}

	if !req.DepartureTime.IsZero() || !req.ArrivalTime.IsZero() {
		if err := ValidateFlightDepartureTime(req.DepartureTime); err != nil {
			return err
		}

		if err := ValidateFlightArrivalTime(req.DepartureTime, req.ArrivalTime); err != nil {
			return err
		}
	}

	if err := ValidateFlightStatus(req.Status); err != nil {
		return err
	}

	return nil
}
