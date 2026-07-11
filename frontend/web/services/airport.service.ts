import { api } from "@/lib/api"
import { Airport } from "@/types/airport";

export async function getAirports(): Promise<Airport[]> {
    const { data } = await api.get<Airport[]>("/airports");
    return data;
}

export async function searchAirports(
    query: string,
    limit = 10,
): Promise<Airport[]> {
    const { data } = await api.get<Airport[]>("/airports/search", {
        params: {
            query,
            limit,
        },
    });

    return data;
}