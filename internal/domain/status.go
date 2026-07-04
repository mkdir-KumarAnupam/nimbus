package domain

type FlightStatus string

const (
	FlightScheduled FlightStatus = "scheduled"
	FlightBoarding  FlightStatus = "boarding"
	FlightDelayed   FlightStatus = "delayed"
	FlightDeparted  FlightStatus = "departed"
	FlightLanded    FlightStatus = "landed"
	FlightCancelled FlightStatus = "cancelled"
)
