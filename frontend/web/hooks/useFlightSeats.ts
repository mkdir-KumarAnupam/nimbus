import { useQuery } from "@tanstack/react-query";

import { getFlightSeats } from "@/services/flight";

export function useFlightSeats(flightId: string) {
  return useQuery({
    queryKey: ["flight-seats", flightId],
    queryFn: () => getFlightSeats(flightId),
    enabled: !!flightId,
    staleTime: 0,
    gcTime: 0, // Disable cache so it always fetches newest seats
  });
}
