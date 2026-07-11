export interface ReservationResponse {
  id: string;
  reservationRef: string;
  userId: string;
  flightId: string;
  flightSeatId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}
