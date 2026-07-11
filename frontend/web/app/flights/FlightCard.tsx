import { FlightSearchResponse } from "@/types/flight";
import { format } from "date-fns";
import { Plane, Clock, Briefcase, Luggage } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFlightSelectionStore } from "@/store/flightSelection";

const AIRPORT_CITIES: Record<string, string> = {
  DEL: "New Delhi",
  BOM: "Mumbai",
  BLR: "Bengaluru",
  MAA: "Chennai",
  CCU: "Kolkata",
  HYD: "Hyderabad",
  PNQ: "Pune",
  AMD: "Ahmedabad",
  COK: "Kochi",
  GOI: "Goa",
};

interface FlightCardProps {
  flight: FlightSearchResponse;
}

export default function FlightCard({
  flight,
}: FlightCardProps) {
  const depDate = new Date(flight.departureTime);
  const arrDate = new Date(flight.arrivalTime);

  const router = useRouter();

  const depTimeStr = format(depDate, "HH:mm");
  const depDateStr = format(depDate, "dd MMM yyyy");
  const arrTimeStr = format(arrDate, "HH:mm");
  const arrDateStr = format(arrDate, "dd MMM yyyy");

  const hours = Math.floor(flight.durationMinutes / 60);
  const minutes = flight.durationMinutes % 60;
  const durationStr = `${hours}h ${minutes}m`;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(flight.lowestPrice);

  const seats = flight.availableSeats;
  let seatTextColor = "text-slate-500 font-bold";

  if (seats <= 2) {
    seatTextColor = "text-rose-600 font-extrabold";
  } else if (seats <= 5) {
    seatTextColor = "text-amber-600 font-extrabold";
  }

  return (
    <div className="
      group
      relative
      p-[1.5px]
      rounded-[2rem]
      overflow-hidden
      bg-transparent
      hover-border-beam
      transition-all
      duration-500
      ease-[cubic-bezier(0.23,1,0.32,1)]
      hover:scale-[1.012]
      shadow-[0_15px_35px_rgba(0,0,0,0.03)]
      hover:shadow-[0_24px_50px_rgba(37,99,235,0.08)]
    ">
      <style>{`
        @keyframes border-beam {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .hover-border-beam::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          transform: translate(-50%, -50%) rotate(0deg);
          background: conic-gradient(from 0deg, transparent 40%, #2563eb 50%, transparent 60%);
          animation: border-beam 4s linear infinite;
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: 0;
        }
        .hover-border-beam:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Inner Card Container */}
      <div className="
        relative
        z-10
        w-full
        h-full
        flex
        flex-col
        gap-6
        py-6
        pr-6
        pl-16
        rounded-[1.95rem]
        bg-white/80
        backdrop-blur-3xl
        backdrop-saturate-200
        border
        border-white/60
        shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]
        transition-all
        duration-500
        ease-[cubic-bezier(0.23,1,0.32,1)]
        group-hover:bg-white/95
        group-hover:border-blue-500/10
        group-hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.95)]
        md:flex-row
        md:items-center
        md:justify-between
      ">

        {/* 1. Vertical Flight Number Tag */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-200/50 border-r border-slate-300/40 rounded-l-[1.95rem] flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-50/60">
          <span className="text-[11px] font-black tracking-[0.2em] text-slate-600 uppercase [writing-mode:vertical-lr] rotate-180 group-hover:text-blue-700 transition-colors duration-300 select-none">
            {flight.flightNumber}
          </span>
        </div>

        {/* 2. CENTER: Timeline (Dep -> Arr) */}
        <div className="flex flex-1 items-center justify-between gap-6 md:px-6">
          {/* Departure */}
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {depTimeStr}
            </span>
            <span className="text-lg font-black text-slate-900 leading-none">
              {flight.departureAirportCode}
            </span>
            <span className="text-xs font-bold text-slate-700 mt-1 mb-0.5">
              {AIRPORT_CITIES[flight.departureAirportCode] || flight.departureAirportCode}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {depDateStr}
            </span>
          </div>

          {/* Duration / Arrow Track */}
          <div className="flex flex-1 flex-col items-center max-w-[200px]">
            {/* Duration text */}
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              {durationStr}
            </span>

            {/* Custom vector timeline divider */}
            <div className="relative w-full flex items-center justify-center">
              {/* Horizontal Line */}
              <div className="absolute inset-x-0 h-[2px] bg-slate-300/80 rounded-full group-hover:bg-blue-300/50 transition-colors duration-500" />

              {/* Outer ring dot left */}
              <div className="absolute left-0 size-2 rounded-full border-2 border-slate-400 bg-white group-hover:border-blue-500 transition-colors duration-500" />

              {/* Outer ring dot right */}
              <div className="absolute right-0 size-2 rounded-full border-2 border-slate-400 bg-white group-hover:border-blue-500 transition-colors duration-500" />

              {/* Flying plane icon in center */}
              <div className="relative z-10 bg-white px-2 py-0.5 rounded-full shadow-xs border border-slate-200 group-hover:border-blue-200 group-hover:translate-x-10 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                <Plane className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 group-hover:rotate-12 transition-all duration-700" />
              </div>
            </div>

            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
              Non-stop
            </span>

            {/* Baggage allowance icons */}
            <div className="flex items-center gap-3 mt-2 text-slate-600">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                <span>7kg</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                <Luggage className="h-3.5 w-3.5 text-slate-500" />
                <span>15kg</span>
              </div>
            </div>
          </div>

          {/* Arrival */}
          <div className="flex flex-col text-right">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {arrTimeStr}
            </span>
            <span className="text-lg font-black text-slate-900 leading-none">
              {flight.arrivalAirportCode}
            </span>
            <span className="text-xs font-bold text-slate-700 mt-1 mb-0.5">
              {AIRPORT_CITIES[flight.arrivalAirportCode] || flight.arrivalAirportCode}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {arrDateStr}
            </span>
          </div>
        </div>

        {/* 3. RIGHT: Price and select button */}
        <div className="flex flex-row items-center justify-between w-full border-t border-slate-200/40 pt-4 md:border-t-0 md:pt-0 md:flex-col md:items-end md:justify-center md:w-auto gap-4">
          <div className="flex flex-col text-left md:text-right">
            {/* Availability Label */}
            <div className="flex items-center md:justify-end mb-1">
              <span className={`text-[10px] uppercase tracking-widest ${seatTextColor}`}>
                {seats} {seats === 1 ? "seat" : "seats"} left
              </span>
            </div>

            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            className="
              flex
              items-center
              gap-1.5
              px-6
              py-3
              rounded-2xl
              font-bold
              text-sm
              text-white
              bg-blue-600
              shadow-[0_8px_20px_rgba(37,99,235,0.2)]
              hover:bg-blue-700
              hover:shadow-[0_12px_24px_rgba(37,99,235,0.3)]
              hover:scale-[1.03]
              active:scale-[0.98]
              transition-all
              duration-300
              cursor-pointer
            "
            onClick={() => {
              useFlightSelectionStore.getState().setSelectedFlight(flight);
              router.push(`/flights/${flight.flightId}`);
            }}
          >
            <span>Choose Flight</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}
