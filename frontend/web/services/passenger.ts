import { api } from "@/lib/api";
import {
  CreatePassengerRequest,
  PassengerResponse,
} from "@/types/passenger";

export async function createPassenger(
  reservationId: string,
  body: CreatePassengerRequest
): Promise<PassengerResponse> {
  const { data } = await api.post<PassengerResponse>(
    `/reservations/${reservationId}/passengers`,
    body
  );

  return data;
}

export async function getPassenger(
  passengerId: string
): Promise<PassengerResponse> {
  const { data } = await api.get<PassengerResponse>(
    `/passengers/${passengerId}`
  );

  return data;
}

export async function getReservationPassengers(
  reservationId: string
): Promise<PassengerResponse[]> {
  const { data } = await api.get<PassengerResponse[]>(
    `/passengers/reservation/${reservationId}`
  );

  return data;
}

export async function updatePassenger(
  passengerId: string,
  body: CreatePassengerRequest
): Promise<PassengerResponse> {
  const { data } = await api.put<PassengerResponse>(
    `/passengers/${passengerId}`,
    body
  );

  return data;
}

export async function deletePassenger(
  passengerId: string
): Promise<void> {
  await api.delete(`/passengers/${passengerId}`);
}
