import { FlightSeatResponse } from "@/types/flightSeats";
import CabinSection from "./CabinSection";
import { Spotlight } from "@/components/ui/spotlight";

interface SeatMapProps {
  seats: FlightSeatResponse[];

  selectedSeat: FlightSeatResponse | null;
  onSelect: (seat: FlightSeatResponse) => void;
}

export default function SeatMap({
  seats,
  selectedSeat,
  onSelect,
}: SeatMapProps) {
  const cabins = {
    first: seats.filter((seat) => seat.class === "first"),
    business: seats.filter((seat) => seat.class === "business"),
    premium_economy: seats.filter(
      (seat) => seat.class === "premium_economy"
    ),
    economy: seats.filter(
      (seat) => seat.class === "economy"
    ),
  };

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
      {/* Fuselage Top (Cockpit/Nose) */}
      <div className="relative h-20 w-[90%] md:w-[85%] flex flex-col items-center justify-center rounded-t-[50%] border-t-[3px] border-x-[3px] border-white/60 bg-white/40 shadow-[0_15px_30px_rgba(0,0,0,0.02),inset_0_2px_10px_rgba(255,255,255,0.8)] backdrop-blur-3xl backdrop-saturate-200">
        {/* Realistic Cockpit Windows */}
        <div className="absolute top-2 left-[15%] w-[70%] flex gap-1 items-end justify-center h-5">
          <div className="w-[15%] h-[60%] bg-slate-300/40 rounded-tl-full border border-white/50 skew-x-[-15deg] shadow-inner" />
          <div className="w-[30%] h-full bg-slate-300/40 rounded-t-lg border border-white/50 shadow-inner" />
          <div className="w-[30%] h-full bg-slate-300/40 rounded-t-lg border border-white/50 shadow-inner" />
          <div className="w-[15%] h-[60%] bg-slate-300/40 rounded-tr-full border border-white/50 skew-x-[15deg] shadow-inner" />
        </div>

        {/* Nose Cone Tip */}
        <div className="absolute -top-1 w-1.5 h-1.5 bg-slate-300 rounded-full" />

        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-5">Front</span>
      </div>

      {/* Main Fuselage Body */}
      <div className="relative w-full border-x-[3px] border-white/60 bg-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.02),inset_0_2px_10px_rgba(255,255,255,0.8)] backdrop-blur-3xl backdrop-saturate-200 py-4">

        {/* Front Doors */}
        <div className="absolute top-8 -left-2.5 h-12 w-2.5 rounded-l-md bg-white/90 border border-slate-300 shadow-sm flex items-center justify-center z-20">
          <div className="h-8 w-0.5 bg-red-500 rounded-full" />
        </div>
        <div className="absolute top-8 -right-2.5 h-12 w-2.5 rounded-r-md bg-white/90 border border-slate-300 shadow-sm flex items-center justify-center z-20">
          <div className="h-8 w-0.5 bg-red-500 rounded-full" />
        </div>



        {/* Overwing Exits */}
        <div className="absolute top-[45%] -left-2 h-8 w-2 rounded-l-sm bg-white border border-slate-300 shadow-sm flex items-center justify-center z-20">
          <div className="h-4 w-0.5 bg-red-500 rounded-full" />
        </div>
        <div className="absolute top-[45%] -right-2 h-8 w-2 rounded-r-sm bg-white border border-slate-300 shadow-sm flex items-center justify-center z-20">
          <div className="h-4 w-0.5 bg-red-500 rounded-full" />
        </div>

        {/* Rear Doors */}
        <div className="absolute bottom-10 -left-2.5 h-12 w-2.5 rounded-l-md bg-white/90 border border-slate-300 shadow-sm flex items-center justify-center z-20">
          <div className="h-8 w-0.5 bg-red-500 rounded-full" />
        </div>
        <div className="absolute bottom-10 -right-2.5 h-12 w-2.5 rounded-r-md bg-white/90 border border-slate-300 shadow-sm flex items-center justify-center z-20">
          <div className="h-8 w-0.5 bg-red-500 rounded-full" />
        </div>

        <div className="space-y-0">
          {cabins.first.length > 0 && (
            <CabinSection
              title="First Class"
              seats={cabins.first}
              selectedSeat={selectedSeat}
              onSelect={onSelect}
            />
          )}

          {cabins.business.length > 0 && (
            <CabinSection
              title="Business"
              seats={cabins.business}
              selectedSeat={selectedSeat}
              onSelect={onSelect}
            />
          )}

          {cabins.premium_economy.length > 0 && (
            <CabinSection
              title="Premium Economy"
              seats={cabins.premium_economy}
              selectedSeat={selectedSeat}
              onSelect={onSelect}
            />
          )}

          {cabins.economy.length > 0 && (
            <CabinSection
              title="Economy"
              seats={cabins.economy}
              selectedSeat={selectedSeat}
              onSelect={onSelect}
            />
          )}
        </div>
      </div>

      {/* Fuselage Bottom (Tail) */}
      <div className="relative h-16 w-[90%] md:w-[85%] rounded-b-[45%] border-b-[3px] border-x-[3px] border-white/60 bg-white/40 shadow-[0_15px_30px_rgba(0,0,0,0.02),inset_0_2px_10px_rgba(255,255,255,0.8)] backdrop-blur-3xl backdrop-saturate-200" />
    </div>
  );
}
