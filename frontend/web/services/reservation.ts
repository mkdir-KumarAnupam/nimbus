import { api } from "@/lib/api";
import { ReservationResponse } from "@/types/reservation";

interface ReserveSeatRequest {
  userId: string;
  flightSeatId: string;
}

export async function reserveSeat(
  body: ReserveSeatRequest
): Promise<ReservationResponse> {
  const { data } = await api.post<ReservationResponse>(
    "/reservations/reserve",
    body
  );

  return data;
}
