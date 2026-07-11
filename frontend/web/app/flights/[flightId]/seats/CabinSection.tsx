import Seat from "./Seat";
import { FlightSeatResponse } from "@/types/flightSeats";

interface CabinSectionProps {
  title: string;
  seats: FlightSeatResponse[];
  selectedSeat: FlightSeatResponse | null;
  onSelect: (seat: FlightSeatResponse) => void;
}

export default function CabinSection({
  title,
  seats,
  selectedSeat,
  onSelect,
}: CabinSectionProps) {
  const rows = new Map<number, FlightSeatResponse[]>();

  [...seats]
    .sort((a, b) => {
      const rowA = parseInt(a.seatNumber);
      const rowB = parseInt(b.seatNumber);
      if (rowA !== rowB) return rowA - rowB;
      return a.seatNumber.localeCompare(b.seatNumber);
    })
    .forEach((seat) => {
      const row = parseInt(seat.seatNumber);
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row)!.push(seat);
    });

  return (
    <section className="mb-6 relative z-10 w-full flex flex-col items-center px-4 py-2">
      <div className="flex items-center gap-4 mb-4 w-full px-4">
        <div className="h-px bg-slate-300/60 flex-1" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {title}
        </h2>
        <div className="h-px bg-slate-300/60 flex-1" />
      </div>

      <div className="flex flex-col gap-2 items-center w-full px-2">
        {[...rows.entries()].map(([row, rowSeats]) => {
          const sortedSeats = [...rowSeats].sort((a, b) => {
            const letterA = a.seatNumber.replace(/[0-9]/g, '');
            const letterB = b.seatNumber.replace(/[0-9]/g, '');
            return letterA.localeCompare(letterB);
          });
          const half = Math.ceil(sortedSeats.length / 2);
          const leftSeats = sortedSeats.slice(0, half);
          const rightSeats = sortedSeats.slice(half);

          return (
            <div key={row} className="flex items-center justify-between w-full max-w-sm">
              <div className="flex gap-2.5 justify-end flex-1">
                {leftSeats.map((seat) => (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    selected={selectedSeat?.id === seat.id}
                    onSelect={onSelect}
                  />
                ))}
              </div>

              <div className="w-24 flex items-center justify-center shrink-0">
                <div className="text-[10px] font-black text-slate-400 bg-slate-200/50 backdrop-blur-sm border border-white/40 px-2.5 py-1 rounded-full shadow-inner">
                  {row}
                </div>
              </div>

              <div className="flex gap-2.5 justify-start flex-1">
                {rightSeats.map((seat) => (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    selected={selectedSeat?.id === seat.id}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
