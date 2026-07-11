import { PassengerResponse } from "@/types/passenger";
import { ReservationResponse } from "@/types/reservation";

interface BookingStore {
  selectedFlightId: string | null;
  selectedSeatId: string | null;

  reservation: ReservationResponse | null;

  passenger: PassengerResponse | null;

  setSelectedFlight: (flightId: string) => void;
  setSelectedSeat: (seatId: string) => void;

  setReservation: (reservation: ReservationResponse) => void;

  setPassenger: (passenger: PassengerResponse) => void;

  clearBooking: () => void;
}
