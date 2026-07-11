import { useQuery } from "@tanstack/react-query";

import { getFlightSeats } from "@/services/flight";

export function useFlightSeats(flightId: string) {
  return useQuery({
    queryKey: ["flight-seats", flightId],
    queryFn: () => getFlightSeats(flightId),
    enabled: !!flightId,
  });
}
