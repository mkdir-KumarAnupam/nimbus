import { create } from "zustand";
import { ReservationResponse } from "@/types/reservation";

interface BookingStore {
  selectedFlightId: string | null;
  selectedSeatId: string | null;
  reservation: ReservationResponse | null;
  passenger: any | null; // using any or PassengerResponse

  setSelectedFlight: (flightId: string) => void;
  setSelectedSeat: (seatId: string) => void;
  setReservation: (reservation: ReservationResponse) => void;
  setPassenger: (passenger: any) => void;

  clearBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedFlightId: null,
  selectedSeatId: null,
  reservation: null,
  passenger: null,

  setSelectedFlight: (flightId) =>
    set({ selectedFlightId: flightId }),

  setSelectedSeat: (seatId) =>
    set({ selectedSeatId: seatId }),

  setReservation: (reservation) =>
    set({ reservation }),

  setPassenger: (passenger) =>
    set({ passenger }),

  clearBooking: () =>
    set({
      selectedFlightId: null,
      selectedSeatId: null,
      reservation: null,
      passenger: null,
    }),
}));
