export type SeatStatus =
  | "available"
  | "held"
  | "booked"
  | "blocked";

export type SeatClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

export interface FlightSeatResponse {
  id: string;
  flightId: string;
  seatId: string;

  seatNumber: string;

  class: SeatClass;

  status: SeatStatus;

  price: number;
}
