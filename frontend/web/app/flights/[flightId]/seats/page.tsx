import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SeatSelectionClient from "./SeatSelectionClient";

interface SeatSelectionPageProps {
  params: Promise<{
    flightId: string;
  }>;
}

export default async function SeatSelectionPage({
  params,
}: SeatSelectionPageProps) {
  const { flightId } = await params;

  return (
    <ProtectedRoute>
      <SeatSelectionClient
        flightId={flightId}
      />
    </ProtectedRoute>
  );
}
