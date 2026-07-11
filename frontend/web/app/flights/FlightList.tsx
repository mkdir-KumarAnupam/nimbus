import FlightCard from "./FlightCard";
import { FlightSearchResponse } from "@/types/flight";

interface FlightListProps {
  flights: FlightSearchResponse[];
}

export default function FlightList({
  flights,
}: FlightListProps) {
  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightCard
          key={flight.flightId}
          flight={flight}
        />
      ))}
    </div>
  );
}
