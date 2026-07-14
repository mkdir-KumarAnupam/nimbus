import { cn } from "../../lib/utils";
export default function NoFlights() {
  return (
    <div className={cn('bg-white', 'p-16', 'border', 'rounded-2xl', 'text-center')}>
      <h2 className={cn('font-semibold', 'text-xl')}>
        No Flights Found
      </h2>

      <p className={cn('mt-2', 'text-gray-500')}>
        Try another date or destination.
      </p>
    </div>
  );
}



















