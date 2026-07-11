import { useQuery } from "@tanstack/react-query";

import { getAirports } from "@/services/airport.service";

export function useAirports() {
    const query = useQuery({
        queryKey: ["airports"],
        queryFn: getAirports,
        staleTime: Infinity,
    });

    return {
        airports: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}