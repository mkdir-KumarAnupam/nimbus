package utils

func GenerateSeatHoldKey(flightSeatID string) string {
	return "seat_hold:" + flightSeatID
}
