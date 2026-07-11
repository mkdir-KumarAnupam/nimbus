import FlightDetailsClient from "./FlightDetailsClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface FlightDetailsPageProps {
  params: Promise<{
    flightId: string;
  }>;
}

export default async function FlightDetailsPage({
  params,
}: FlightDetailsPageProps) {
  const { flightId } = await params;

  return (
    <ProtectedRoute>
      <FlightDetailsClient
        flightId={flightId}
      />
    </ProtectedRoute>
  );
}
