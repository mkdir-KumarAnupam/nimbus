import { api } from "@/lib/api";
import {
  FlightSearchRequest,
  FlightSearchResponse,
  FlightResponse, // or FlightDetailsResponse later
} from "@/types/flight";;
import { FlightSeatResponse } from "@/types/flightSeats"

export async function searchFlights(
  request: FlightSearchRequest
): Promise<FlightSearchResponse[]> {
  const { data } = await api.post<FlightSearchResponse[]>(
    "/flights/search",
    request
  );

  return data;
}

export async function getFlightById(

  id: string,

): Promise<FlightResponse> {

  const { data } = await api.get<FlightResponse>(

    `/flights/${id}`,

  );

  return data;

}

export async function getFlightSeats(
  flightId: string,
): Promise<FlightSeatResponse[]> {
  const { data } = await api.get<FlightSeatResponse[]>(
    `/flight-seats/flight/${flightId}`,
  );

  return data;
}
