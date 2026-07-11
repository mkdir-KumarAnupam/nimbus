export type CabinClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "LANDED"
  | "CANCELLED"
  | "DELAYED";

export interface FlightSearchRequest {
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureDate: string;
  passengers: number;
  cabinClass: CabinClass;
  orderBy?: string;
}

export interface FlightSearchResponse {
  flightId: string;
  flightNumber: string;

  departureAirportCode: string;
  arrivalAirportCode: string;

  status: FlightStatus;

  departureTime: string;
  arrivalTime: string;

  durationMinutes: number;

  availableSeats: number;
  lowestPrice: number;
}

export interface FlightResponse {
  id: string;

  flightNumber: string;

  aircraftId: string;

  originAirportId: string;
  destinationAirportId: string;

  departureTime: string;
  arrivalTime: string;

  status: string;
}

