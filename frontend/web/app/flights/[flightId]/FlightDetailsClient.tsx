"use client";

import { useFlight } from "@/hooks/useFlight";
import { useAirports } from "@/hooks/useAirport";
import { useAircraft } from "@/hooks/useAircraft";
import { useRouter, useSearchParams } from "next/navigation";
import { useFlightSelectionStore } from "@/store/flightSelection";
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Plane,
  Briefcase,
  Luggage,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Armchair
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Breadcrumb from "@/components/Breadcrumb";

interface FlightDetailsClientProps {
  flightId: string;
}

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

const CABIN_LABELS: Record<string, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

// Deterministic price based on ID hash (fallback)
const getDeterministicPrice = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 5000) + 4200; // range 4200 - 9200
};

export default function FlightDetailsClient({
  flightId,
}: FlightDetailsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFlight = useFlightSelectionStore((state) => state.selectedFlight);

  const paxCount = searchParams.get("passengers") || "1";
  const cabinClass = searchParams.get("cabin") || "economy";
  const formattedCabin = CABIN_LABELS[cabinClass] || "Economy";
  const passengerLabel = `${paxCount} ${paxCount === "1" ? "Adult" : "Adults"} • ${formattedCabin}`;

  const {
    data: flight,
    isLoading: isFlightLoading,
    error: flightError,
  } = useFlight(flightId);

  const { airports, isLoading: isAirportsLoading } = useAirports();

  // Fetch actual aircraft using hook
  const aircraftId = flight?.aircraftId || "";
  const { data: aircraft, isLoading: isAircraftLoading } = useAircraft(aircraftId);

  if (isFlightLoading || isAirportsLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest animate-pulse">Loading Flight Details...</span>
        </div>
      </main>
    );
  }

  if (flightError || !flight) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="p-8 rounded-[2rem] bg-white border border-rose-100 max-w-md w-full flex flex-col items-center text-center shadow-md">
          <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-extrabold text-slate-900">Flight Load Error</h2>
          <p className="mt-2 text-sm text-slate-500">We couldn't retrieve the details for this flight. It may have expired or does not exist.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm select-none cursor-pointer"
          >
            Go Back Search
          </button>
        </div>
      </main>
    );
  }

  // Map Airports
  const originAirport = airports.find((a) => a.id === flight.originAirportId) || null;
  const destinationAirport = airports.find((a) => a.id === flight.destinationAirportId) || null;

  const originCode = originAirport?.code || "DEL";
  const destinationCode = destinationAirport?.code || "BOM";

  const depDate = new Date(flight.departureTime);
  const arrDate = new Date(flight.arrivalTime);

  const depTimeStr = format(depDate, "HH:mm");
  const depDateStr = format(depDate, "dd MMM yyyy");
  const arrTimeStr = format(arrDate, "HH:mm");
  const arrDateStr = format(arrDate, "dd MMM yyyy");

  const durationMinutes = Math.floor((arrDate.getTime() - depDate.getTime()) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationStr = `${hours}h ${mins}m`;

  const totalCost = selectedFlight?.lowestPrice ?? getDeterministicPrice(flightId);
  const basePrice = Math.floor(totalCost / 1.12);
  const taxes = totalCost - basePrice;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalCost);

  const formattedBase = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(basePrice);

  const formattedTaxes = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(taxes);

  return (
    <main className="relative min-h-screen bg-slate-100 pb-20 overflow-hidden">
      {/* Subtle background gradient and high-contrast colorful static blobs to highlight glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-blue-50/10 to-indigo-50/10 pointer-events-none select-none z-0 overflow-hidden">
        {/* Soft colorful shapes placed behind content card areas */}
        <div className="absolute top-[15%] left-[25%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-300 to-indigo-400 opacity-25 blur-[100px]" />
        <div className="absolute top-[40%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-300 to-pink-300 opacity-[0.16] blur-[120px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-sky-200 to-emerald-200 opacity-[0.15] blur-[90px]" />
      </div>

      {/* Embedded interactive keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sweep {
          0% { transform: scaleX(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-delayed {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
        }
        .ticket-cutout-line {
          position: relative;
        }
        .ticket-cutout-line::before {
          content: "";
          position: absolute;
          left: -42px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f1f5f9; /* Slate 100 base */
          border-right: 1px solid rgba(226, 232, 240, 0.8);
          z-index: 10;
        }
        .ticket-cutout-line::after {
          content: "";
          position: absolute;
          right: -42px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f1f5f9;
          border-left: 1px solid rgba(226, 232, 240, 0.8);
          z-index: 10;
        }
      `}</style>

      {/* Edge-Attached Floating Back Button (Desktop) */}
      <button
        onClick={() => router.back()}
        className="
          fixed left-0 top-1/2 -translate-y-1/2 z-[100]
          group hidden md:flex items-center justify-center
          w-12 h-32 xl:w-16 xl:h-40
          rounded-r-[2.5rem]
          bg-white/40 hover:bg-white/70
          backdrop-blur-3xl backdrop-saturate-200
          border-y border-r border-white/80
          shadow-[8px_0_32px_rgba(0,0,0,0.06),inset_2px_0_8px_rgba(255,255,255,1)]
          hover:shadow-[16px_0_48px_rgba(0,0,0,0.1),inset_4px_0_12px_rgba(255,255,255,1)]
          transition-all duration-500 ease-out
          hover:w-16 hover:xl:w-20 active:scale-[0.98]
          pr-2 xl:pr-3
        "
      >
        <ArrowLeft className="h-6 w-6 xl:h-8 xl:w-8 text-slate-600 group-hover:text-slate-900 transition-transform duration-300 group-hover:-translate-x-1" />
      </button>

      {/* Restricting layout width to max-w-4xl to resolve excessive whitespace */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-6 animate-fade-in flex flex-col gap-8">

        {/* Top Header: Breadcrumbs & Mobile Back Button */}
        <div className="relative flex flex-col gap-6 w-full">
          <Breadcrumb currentStep="flight" />
          <div className="w-full flex md:hidden justify-start">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white/50 backdrop-blur-md border border-white/60 rounded-[1.25rem] hover:bg-white/80 hover:text-slate-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)] select-none cursor-pointer w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Boarding Pass inspired Flight Details block */}
        <div className="flex flex-col gap-6">

          {/* Main Boarding Pass Body */}
          <div className="
            relative
            p-8
            rounded-[2.5rem]
            bg-white/80
            backdrop-blur-3xl
            backdrop-saturate-200
            border
            border-white/60
            shadow-[0_20px_50px_rgba(0,0,0,0.02),inset_0_2px_4px_rgba(255,255,255,0.8)]
            flex
            flex-col
            gap-6
          ">
            {/* Top Row: Flight Code / Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/40">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-blue-650 -rotate-45" />
                <span className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {passengerLabel}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-widest">Flight Code</span>
                <span className="text-sm font-black text-slate-800 block uppercase tracking-wider">{flight.flightNumber}</span>
              </div>
            </div>

            {/* Middle Row: Departure & Arrival Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.5fr] gap-6 items-center py-4">

              {/* Departure Detail */}
              <div className="flex flex-col text-left">
                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-1.5">
                  {depTimeStr}
                </span>
                <span className="text-2xl font-black text-blue-600 uppercase tracking-tight mb-1">
                  {originCode}
                </span>
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {AIRPORT_CITIES[originCode] || originAirport?.city || "Departure"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {originAirport?.name || "Terminal 3"}
                </span>
              </div>

              {/* Journey Duration Vector */}
              <div className="flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-[11px] font-black text-slate-650 uppercase tracking-wider mb-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {durationStr}
                </span>

                <div className="relative w-full flex items-center justify-center">
                  <div className="absolute inset-x-0 h-[2px] bg-slate-300/80 rounded-full" />
                  <div className="absolute left-0 size-2 rounded-full border-2 border-slate-400 bg-white" />
                  <div className="absolute right-0 size-2 rounded-full border-2 border-slate-400 bg-white" />
                  <div className="relative z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                    <Plane className="h-4 w-4 text-slate-550 rotate-45" />
                  </div>
                </div>

                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2.5">
                  Non-stop
                </span>
              </div>

              {/* Arrival Detail */}
              <div className="flex flex-col text-right">
                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-1.5">
                  {arrTimeStr}
                </span>
                <span className="text-2xl font-black text-blue-600 uppercase tracking-tight mb-1">
                  {destinationCode}
                </span>
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {AIRPORT_CITIES[destinationCode] || destinationAirport?.city || "Arrival"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {destinationAirport?.name || "Terminal 2"}
                </span>
              </div>
            </div>

            {/* Boarding Ticket Cutout Notches & Divider */}
            <div className="ticket-cutout-line border-t-2 border-dashed border-slate-200/80 my-2" />

            {/* Lower Row: Date specs */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div>
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Departure Date</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-850">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{depDateStr}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Arrival Date</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-850 justify-end">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{arrDateStr}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Combined Details & Action Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-delayed">

            {/* Left Box: Aircraft & Baggage details */}
            <div className="
              p-8
              rounded-[2.5rem]
              bg-white/80
              backdrop-blur-3xl
              backdrop-saturate-200
              border
              border-white/60
              shadow-[0_15px_35px_rgba(0,0,0,0.02),inset_0_2px_4px_rgba(255,255,255,0.8)]
              flex
              flex-col
              justify-between
              gap-6
            ">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aircraft Model</span>
                {isAircraftLoading ? (
                  <div className="h-5 w-32 bg-slate-200 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-base font-extrabold text-slate-850">
                      {aircraft?.model || "Boeing 737 MAX 8"}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Tail registration: {aircraft?.registration || "VT-AGF"}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Baggage Allowance</span>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Luggage className="h-4.5 w-4.5 text-slate-650" /> Checked: 15kg
                  </span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-slate-650" /> Cabin: 7kg
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In-flight Comfort</span>
                <span className="text-xs font-bold text-slate-650">Complimentary Hot Meals • Fast Charging USB Ports</span>
              </div>
            </div>

            {/* Right Box: Billing Fare & Book Action */}
            <div className="
              p-8
              rounded-[2.5rem]
              bg-white/80
              backdrop-blur-3xl
              backdrop-saturate-200
              border
              border-white/60
              shadow-[0_15px_35px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)]
              flex
              flex-col
              justify-between
              gap-6
            ">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-200/50 uppercase tracking-wider">Fare Summary</h3>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-650">
                    <span>Base Fare</span>
                    <span>{formattedBase}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-650">
                    <span>Taxes & Fees (12%)</span>
                    <span>{formattedTaxes}</span>
                  </div>
                  <Separator className="bg-slate-200/60 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-850">Total Price</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{formattedPrice}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Booking Button */}
                <button
                  type="button"
                  className="
                    w-full
                    py-3.5
                    rounded-2xl
                    font-extrabold
                    text-sm
                    text-white
                    bg-blue-600
                    shadow-[0_8px_20px_rgba(37,99,235,0.2)]
                    hover:bg-blue-700
                    hover:shadow-[0_12px_24px_rgba(37,99,235,0.3)]
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    transition-all
                    duration-300
                    cursor-pointer
                    flex
                    items-center
                    justify-center
                    gap-1.5
                  "
                  onClick={() => {
                    router.push(`/flights/${flight.id}/seats`);
                  }}
                >
                  <span>Choose Seat</span>
                  <span>→</span>
                </button>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-550 justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Refundable within 24h</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
