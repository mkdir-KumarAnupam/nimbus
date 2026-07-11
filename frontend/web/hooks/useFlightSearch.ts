import { useMutation } from "@tanstack/react-query";

import { searchFlights } from "@/services/flight";

export function useFlightSearch() {
  return useMutation({
    mutationFn: searchFlights,
  });
}
