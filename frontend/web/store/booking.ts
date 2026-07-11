import { create } from "zustand";
import { ReservationResponse } from "@/services/reservation";

interface BookingStore {
  selectedFlightId: string | null;
  selectedSeatId: string | null;
  reservation: ReservationResponse | null;

  setSelectedFlight: (flightId: string) => void;
  setSelectedSeat: (seatId: string) => void;
  setReservation: (reservation: ReservationResponse) => void;

  clearBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedFlightId: null,
  selectedSeatId: null,
  reservation: null,

  setSelectedFlight: (flightId) =>
    set({ selectedFlightId: flightId }),

  setSelectedSeat: (seatId) =>
    set({ selectedSeatId: seatId }),

  setReservation: (reservation) =>
    set({ reservation }),

  clearBooking: () =>
    set({
      selectedFlightId: null,
      selectedSeatId: null,
      reservation: null,
    }),
}));
