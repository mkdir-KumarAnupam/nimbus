import { FlightSeatResponse } from "@/types/flightSeats";
import clsx from "clsx";

interface SeatProps {
  seat: FlightSeatResponse;
  selected: boolean;
  onSelect: (seat: FlightSeatResponse) => void;
}

export default function Seat({
  seat,
  selected,
  onSelect,
}: SeatProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(seat.price);

  return (
    <div className="relative group/tooltip">
      <button
        type="button"
        disabled={seat.status !== "available"}
        onClick={() => onSelect(seat)}
        className={clsx(
          "relative flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] text-[10px] font-black transition-all duration-300 group",
          
          // Armrests visual hint
          "before:absolute before:inset-x-1 before:-top-0.5 before:h-1 before:rounded-t-sm before:bg-white/20",

          // Selected seat takes precedence
          selected &&
          "border-blue-500 bg-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] scale-[1.05] z-20 ring-2 ring-blue-500/30",

          !selected &&
          seat.status === "available" &&
          "cursor-pointer border-white/60 bg-white/40 text-slate-700 hover:bg-white/70 hover:shadow-lg hover:scale-105 hover:border-white/80",

          !selected &&
          (seat.status === "held" || seat.status === "blocked") &&
          "cursor-not-allowed border-yellow-300/60 bg-yellow-100/50 text-yellow-700",

          !selected &&
          seat.status === "booked" &&
          "cursor-not-allowed border-slate-400/50 bg-slate-300/50 text-slate-500/70"
        )}
      >
        {/* Seat Number */}
        <span className={clsx("z-10 transition-colors duration-300", selected ? "text-white" : "")}>
          {seat.seatNumber}
        </span>
        
        {/* subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-[12px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] pointer-events-none" />
      </button>

      {/* Hover Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100 z-50">
        <div className="bg-slate-900/90 text-white text-[11px] p-2.5 rounded-xl shadow-xl flex flex-col gap-1 backdrop-blur-md border border-white/20">
          <div className="font-black flex justify-between gap-6 text-sm">
            <span>{seat.seatNumber}</span>
            <span className="text-blue-300">{formattedPrice}</span>
          </div>
          <div className="flex justify-between gap-6 font-bold text-slate-300">
            <span className="capitalize">{seat.class.replace('_', ' ')}</span>
            <span className="capitalize">{seat.status}</span>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900/90" />
      </div>
    </div>
  );
}
