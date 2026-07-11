import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FlightSearchResponse } from '@/types/flight';

interface FlightSelectionState {
  selectedFlight: FlightSearchResponse | null;
  setSelectedFlight: (flight: FlightSearchResponse | null) => void;
}

export const useFlightSelectionStore = create<FlightSelectionState>()(
  persist(
    (set) => ({
      selectedFlight: null,
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
    }),
    {
      name: 'flight-selection-storage',
    }
  )
);
