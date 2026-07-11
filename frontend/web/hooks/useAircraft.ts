import { useQuery } from "@tanstack/react-query";
import { getAircraftById } from "@/services/aircraft";

export function useAircraft(id: string) {
  return useQuery({
    queryKey: ["aircraft", id],
    queryFn: () => getAircraftById(id),
    enabled: !!id,
  });
}
