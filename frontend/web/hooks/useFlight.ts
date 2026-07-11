import { useQuery } from "@tanstack/react-query";

import { getFlightById } from "@/services/flight";

export function useFlight(id: string) {
  return useQuery({
    queryKey: ["flight", id],
    queryFn: () => getFlightById(id),
    enabled: !!id,
  });
}
