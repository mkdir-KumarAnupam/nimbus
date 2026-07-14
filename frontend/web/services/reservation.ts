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

export async function cancelReservation(
  reservationId: string,
  userId: string
): Promise<void> {
  await api.delete(`/reservations/${reservationId}/user/${userId}`);
}

export async function getUserReservations(
  userId: string
): Promise<ReservationResponse[]> {
  const { data } = await api.get<ReservationResponse[]>(
    `/reservations/user/${userId}`
  );
  return data;
}
