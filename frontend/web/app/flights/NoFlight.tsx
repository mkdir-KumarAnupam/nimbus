export default function NoFlights() {
  return (
    <div className="rounded-2xl border bg-white p-16 text-center">
      <h2 className="text-xl font-semibold">
        No Flights Found
      </h2>

      <p className="mt-2 text-gray-500">
        Try another date or destination.
      </p>
    </div>
  );
}
