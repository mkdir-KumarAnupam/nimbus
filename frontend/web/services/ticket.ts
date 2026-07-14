import { api } from "@/lib/api";

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  flightId: string;
  reservationId: string;
  status: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTicketByReservationId(reservationId: string): Promise<Ticket> {
  const { data } = await api.get<Ticket>(`/tickets/reservation/${reservationId}`);
  return data;
}