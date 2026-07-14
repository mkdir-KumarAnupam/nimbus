"use client";

import { useFlightSeats } from "@/hooks/useFlightSeats";
import SeatMap from "./SeatMap";
import Breadcrumb from "@/components/Breadcrumb";
import SeatLegend from "./SeatLegend";
import { FlightSeatResponse } from "@/types/flightSeats";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plane } from "lucide-react";
import { useFlight } from "@/hooks/useFlight";
import { useAirports } from "@/hooks/useAirport";
import { format } from "date-fns";
import { Spotlight } from "@/components/ui/spotlight";
import { reserveSeat } from "@/services/reservation";
import { useAuthStore } from "@/store/auth";
import { useBookingStore } from "@/store/booking";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

interface SeatSelectionClientProps {
  flightId: string;
}



export default function SeatSelectionClient({
  flightId,
}: SeatSelectionClientProps) {
  const router = useRouter();


  const user = useAuthStore((state) => state.user);

  const selectedSeatId = useBookingStore(
    (state) => state.selectedSeatId
  );

  const setReservation = useBookingStore(
    (state) => state.setReservation
  );

  const setSelectedSeatId = useBookingStore(
    (state) => state.setSelectedSeat
  );

  const {
    data: seats,
    isLoading: isSeatsLoading,
    error: seatsError,
  } = useFlightSeats(flightId);

  const { data: flight, isLoading: isFlightLoading } = useFlight(flightId);
  const { airports, isLoading: isAirportsLoading } = useAirports();

  const [selectedSeat, setSelectedSeat] =
    useState<FlightSeatResponse | null>(null);


  function handleSelect(seat: FlightSeatResponse) {
    if (seat.status !== "available") {
      return;
    }

    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null);
      return;
    }

    setSelectedSeat(seat);
  }

  const [isReserving, setIsReserving] = useState(false);

  const handleReserveSeat = async () => {
    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    if (!selectedSeat) {
      toast.error("Please select a seat.");
      return;
    }

    setIsReserving(true);

    try {
      const reservation = await reserveSeat({
        userId: user.id,
        flightSeatId: selectedSeat.id,
      });

      setSelectedSeatId(selectedSeat.id);
      setReservation(reservation);

      toast.success("Seat reserved successfully.");

      router.push("/passenger");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ??
        "Unable to reserve seat."
      );
    } finally {
      setIsReserving(false);
    }
  };


  if (isSeatsLoading || isFlightLoading || isAirportsLoading) {
    return (
      <main className={cn('relative', 'min-h-screen', 'bg-slate-100', 'flex', 'items-center', 'justify-center', 'overflow-hidden')}>

        {/* Background blobs for continuity */}
        <div className={cn('absolute', 'inset-0', 'bg-gradient-to-tr', 'from-slate-100', 'via-blue-50/10', 'to-indigo-50/10', 'pointer-events-none', 'select-none', 'z-0', 'overflow-hidden')}>
          <div className={cn('absolute', 'top-[15%]', 'left-[25%]', 'w-[400px]', 'h-[400px]', 'rounded-full', 'bg-gradient-to-tr', 'from-blue-300', 'to-indigo-400', 'opacity-25', 'blur-[100px]')} />
          <div className={cn('absolute', 'top-[40%]', 'right-[15%]', 'w-[450px]', 'h-[450px]', 'rounded-full', 'bg-gradient-to-br', 'from-violet-300', 'to-pink-300', 'opacity-[0.16]', 'blur-[120px]')} />
          <div className={cn('absolute', 'bottom-[5%]', 'left-[10%]', 'w-[380px]', 'h-[380px]', 'rounded-full', 'bg-gradient-to-tr', 'from-sky-200', 'to-emerald-200', 'opacity-[0.15]', 'blur-[90px]')} />
        </div>

        <div className={cn('relative', 'z-10', 'w-24', 'h-24')}>
          <div className={cn('absolute', 'inset-0', 'rounded-full', 'blur-2xl', 'bg-blue-500/20', 'animate-pulse')} />
          <div className={cn('w-full', 'h-full', 'rounded-full', 'border', 'border-white/40', 'bg-white/10', 'backdrop-blur-2xl', 'shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_4px_12px_rgba(255,255,255,0.8)]', 'flex', 'items-center', 'justify-center', 'relative', 'overflow-hidden')}>
            {/* The sweeping gradient tail */}
            <div
              className={cn('absolute', 'inset-[-50%]', 'animate-[spin_1.5s_linear_infinite]')}
              style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(59, 130, 246, 0.9) 100%)' }}
            />
            {/* The inner cutout to make it a donut */}
            <div className={cn('absolute', 'inset-[4px]', 'rounded-full', 'bg-slate-50', 'border', 'border-white/60', 'shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)]')} />
          </div>
        </div>
      </main>
    );
  }

  if (seatsError) {
    return <div>Failed to load seats.</div>;
  }

  if (!seats || !flight) {
    return <div>No seats found.</div>;
  }

  // Calculate occupancy
  const unavailableSeats = seats.filter((s) => s.status !== "available").length;
  const totalSeats = seats.length;
  const occupancyRate = Math.round((unavailableSeats / totalSeats) * 100);

  // Flight formatting
  const originAirport = airports.find((a) => a.id === flight.originAirportId);
  const destinationAirport = airports.find((a) => a.id === flight.destinationAirportId);
  const originCode = originAirport?.code || "DEL";
  const destinationCode = destinationAirport?.code || "BOM";

  const originCity = originAirport?.city || "Delhi";
  const destinationCity = destinationAirport?.city || "Mumbai";

  const depDate = new Date(flight.departureTime);
  const arrDate = new Date(flight.arrivalTime);
  const depDateStr = format(depDate, "dd MMM yyyy");

  const durationMinutes = Math.floor((arrDate.getTime() - depDate.getTime()) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationStr = `${hours}h ${mins}m`;
  console.log(seats)



  // Base fare + arbitrary logic for taxes for the demo
  const selectedSeatPrice = selectedSeat?.price || 0;
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(selectedSeatPrice);

  return (
    <main className={cn('relative', 'min-h-screen', 'bg-slate-100', 'pb-20', 'overflow-hidden')}>
      {/* Subtle background gradient and high-contrast colorful static blobs to highlight glassmorphism */}
      <div className={cn('absolute', 'inset-0', 'bg-gradient-to-tr', 'from-slate-100', 'via-blue-50/10', 'to-indigo-50/10', 'pointer-events-none', 'select-none', 'z-0', 'overflow-hidden')}>
        <div className={cn('absolute', 'top-[15%]', 'left-[25%]', 'w-[400px]', 'h-[400px]', 'rounded-full', 'bg-gradient-to-tr', 'from-blue-300', 'to-indigo-400', 'opacity-25', 'blur-[100px]')} />
        <div className={cn('absolute', 'top-[40%]', 'right-[15%]', 'w-[450px]', 'h-[450px]', 'rounded-full', 'bg-gradient-to-br', 'from-violet-300', 'to-pink-300', 'opacity-[0.16]', 'blur-[120px]')} />
        <div className={cn('absolute', 'bottom-[5%]', 'left-[10%]', 'w-[380px]', 'h-[380px]', 'rounded-full', 'bg-gradient-to-tr', 'from-sky-200', 'to-emerald-200', 'opacity-[0.15]', 'blur-[90px]')} />
      </div>
      <Spotlight fill="#70CBF6" />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Edge-Attached Floating Back Button (Desktop) */}
      <button
        onClick={() => router.back()}
        className={cn('fixed', 'left-0', 'top-1/2', '-translate-y-1/2', 'z-[100]', 'group', 'hidden', 'md:flex', 'items-center', 'justify-center', 'w-12', 'h-32', 'xl:w-16', 'xl:h-40', 'rounded-r-[2.5rem]', 'bg-white/40', 'hover:bg-white/70', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'border-y', 'border-r', 'border-white/80', 'shadow-[8px_0_32px_rgba(0,0,0,0.06),inset_2px_0_8px_rgba(255,255,255,1)]', 'hover:shadow-[16px_0_48px_rgba(0,0,0,0.1),inset_4px_0_12px_rgba(255,255,255,1)]', 'transition-all', 'duration-500', 'ease-out', 'hover:w-16', 'hover:xl:w-20', 'active:scale-[0.98]', 'pr-2', 'xl:pr-3')}
      >
        <ArrowLeft className={cn('h-6', 'w-6', 'xl:h-8', 'xl:w-8', 'text-slate-600', 'group-hover:text-slate-900', 'transition-transform', 'duration-300', 'group-hover:-translate-x-1')} />
      </button>

      <div className={cn('relative', 'z-10', 'mx-auto', 'max-w-6xl', 'px-6', 'py-6', 'animate-fade-in', 'flex', 'flex-col', 'gap-8')}>

        {/* Top Header: Breadcrumbs & Mobile Back Button */}
        <div className={cn('relative', 'flex', 'flex-col', 'gap-6', 'w-full')}>
          <Breadcrumb currentStep="seat" />
          <div className={cn('w-full', 'flex', 'md:hidden', 'justify-start')}>
            <button
              onClick={() => router.back()}
              className={cn('group', 'flex', 'items-center', 'gap-2', 'px-5', 'py-2.5', 'text-[10px]', 'font-black', 'uppercase', 'tracking-wider', 'text-slate-600', 'bg-white/50', 'backdrop-blur-md', 'border', 'border-white/60', 'rounded-[1.25rem]', 'hover:bg-white/80', 'hover:text-slate-800', 'transition-all', 'shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)]', 'select-none', 'cursor-pointer', 'w-fit')}
            >
              <ArrowLeft className={cn('h-3.5', 'w-3.5', 'transition-transform', 'group-hover:-translate-x-0.5')} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Main Selection Area */}
        <div className={cn('flex', 'flex-col', 'lg:flex-row', 'gap-6', 'xl:gap-10', 'mt-4')}>

          {/* Center: Airplane Map */}
          <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'lg:border-r', 'border-slate-200/50', 'px-4')}>
            <div className={cn('mb-4', 'flex', 'flex-col', 'items-center', 'text-center')}>
              <h1 className={cn('text-3xl', 'font-black', 'tracking-tight', 'text-slate-900')}>Select your seat</h1>
              <p className={cn('text-slate-500', 'font-bold', 'mt-1')}>Choose a comfortable spot for your journey</p>
            </div>

            <SeatMap
              seats={seats}
              selectedSeat={selectedSeat}
              onSelect={handleSelect}
            />
          </div>

          {/* Right Side: Summary & Legend */}
          <div className={cn('w-full', 'lg:w-96', 'shrink-0', 'flex', 'flex-col', 'gap-6', 'sticky', 'top-6', 'max-h-[calc(100vh-3rem)]', 'overflow-y-auto', 'scrollbar-hide', 'pb-10')}>

            {/* Flight Details Mini-Card */}
            <div className={cn('relative', 'p-6', 'rounded-[2.5rem]', 'bg-gradient-to-br', 'from-white/80', 'to-white/40', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'border', 'border-white/80', 'shadow-[0_8px_30px_rgba(0,0,0,0.04),inset_0_2px_10px_rgba(255,255,255,1)]', 'flex', 'flex-col', 'gap-5', 'overflow-hidden')}>
              {/* Glass Glare */}
              <div className={cn('absolute', 'top-0', 'inset-x-0', 'h-1/2', 'bg-gradient-to-b', 'from-white/60', 'to-transparent', 'pointer-events-none')} />

              <div className={cn('flex', 'justify-between', 'items-center', 'z-10', 'relative')}>
                <span className={cn('text-[10px]', 'font-black', 'uppercase', 'tracking-widest', 'text-slate-500')}>{depDateStr}</span>
                <span className={cn('text-[10px]', 'font-black', 'uppercase', 'tracking-widest', 'text-slate-500', 'bg-slate-100/80', 'px-2', 'py-0.5', 'rounded-md', 'border', 'border-slate-200/50', 'shadow-sm')}>{flight.flightNumber}</span>
              </div>

              <div className={cn('flex', 'items-center', 'justify-between', 'gap-4', 'mt-2', 'z-10', 'relative')}>
                <div className={cn('flex', 'flex-col', 'min-w-[3rem]')}>
                  <span className={cn('text-3xl', 'font-black', 'text-slate-900', 'tracking-tighter', 'drop-shadow-sm')}>{originCode}</span>
                  <span className={cn('text-[10px]', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'mt-0.5', 'truncate')}>{originCity}</span>
                </div>

                {/* Flight Visualizer */}
                <div className={cn('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'relative', 'px-3')}>
                  <span className={cn('text-[9px]', 'font-black', 'uppercase', 'tracking-widest', 'text-blue-600', 'absolute', '-top-4')}>
                    {durationStr}
                  </span>

                  <div className={cn('w-full', 'flex', 'items-center', 'relative', 'mt-1')}>
                    <div className={cn('w-1.5', 'h-1.5', 'rounded-full', 'border-[1.5px]', 'border-blue-400', 'bg-white', 'z-10', 'shadow-[0_0_5px_rgba(96,165,250,0.5)]')} />
                    <div className={cn('flex-1', 'border-t-[1.5px]', 'border-dashed', 'border-slate-300', 'relative')}>
                      <div className={cn('absolute', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'bg-white/90', 'p-1.5', 'rounded-full', 'z-10', 'backdrop-blur-md', 'border', 'border-slate-200', 'shadow-sm')}>
                        <Plane className={cn('h-3.5', 'w-3.5', 'text-blue-600', 'rotate-45', 'drop-shadow-sm')} />
                      </div>
                    </div>
                    <div className={cn('w-1.5', 'h-1.5', 'rounded-full', 'border-[1.5px]', 'border-blue-400', 'bg-white', 'z-10', 'shadow-[0_0_5px_rgba(96,165,250,0.5)]')} />
                  </div>

                  <span className={cn('text-[8px]', 'font-extrabold', 'uppercase', 'tracking-widest', 'text-slate-400', 'mt-2', 'absolute', '-bottom-5')}>
                    Non-stop
                  </span>
                </div>

                <div className={cn('flex', 'flex-col', 'text-right', 'min-w-[3rem]')}>
                  <span className={cn('text-3xl', 'font-black', 'text-slate-900', 'tracking-tighter', 'drop-shadow-sm')}>{destinationCode}</span>
                  <span className={cn('text-[10px]', 'font-bold', 'text-slate-500', 'uppercase', 'tracking-widest', 'mt-0.5', 'truncate')}>{destinationCity}</span>
                </div>
              </div>

              <div className={cn('h-px', 'w-full', 'bg-gradient-to-r', 'from-transparent', 'via-slate-200/80', 'to-transparent', 'my-1', 'z-10', 'relative')} />

              <div className={cn('flex', 'justify-between', 'items-center', 'z-10', 'relative')}>
                <span className={cn('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest')}>Occupancy</span>
                <div className={cn('flex', 'items-center', 'gap-2')}>
                  <div className={cn('w-16', 'h-1.5', 'bg-slate-200/50', 'rounded-full', 'overflow-hidden', 'shadow-inner')}>
                    <div className={cn('h-full', 'bg-blue-500', 'rounded-full', 'transition-all', 'shadow-[0_0_8px_rgba(59,130,246,0.6)]')} style={{ width: `${occupancyRate}%` }} />
                  </div>
                  <span className={cn('text-[10px]', 'font-black', 'text-slate-800')}>{occupancyRate}%</span>
                </div>
              </div>
            </div>

            {/* Seat Summary Card */}
            <div className={cn('relative', 'p-6', 'rounded-[2.5rem]', 'bg-gradient-to-b', 'from-white/70', 'to-white/40', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'border', 'border-white/80', 'shadow-[0_8px_30px_rgba(0,0,0,0.04),inset_0_2px_10px_rgba(255,255,255,1)]', 'flex', 'flex-col', 'gap-5', 'overflow-hidden')}>
              {/* Glass Glare */}
              <div className={cn('absolute', 'top-0', 'inset-x-0', 'h-1/2', 'bg-gradient-to-b', 'from-white/60', 'to-transparent', 'pointer-events-none')} />

              <div className={cn('flex', 'flex-col', 'gap-1', 'z-10', 'relative', 'border-b', 'border-slate-200/50', 'pb-4')}>
                <span className={cn('text-[10px]', 'font-black', 'text-slate-500', 'uppercase', 'tracking-widest')}>Selected Seat</span>
                <div className={cn('flex', 'items-end', 'justify-between', 'mt-1')}>
                  <span className={cn('text-4xl', 'font-black', 'text-slate-900', 'leading-none', 'tracking-tighter', 'drop-shadow-sm')}>
                    {selectedSeat ? selectedSeat.seatNumber : "--"}
                  </span>
                  <span className={cn('text-[10px]', 'font-bold', 'text-blue-600', 'uppercase', 'tracking-widest', 'mb-1', 'px-3', 'py-1', 'bg-blue-100/50', 'rounded-full', 'border', 'border-blue-200/50', 'backdrop-blur-sm', 'shadow-inner')}>
                    {selectedSeat ? selectedSeat.class.replace("_", " ") : "None"}
                  </span>
                </div>
              </div>

              <div className={cn('flex', 'justify-between', 'items-center', 'pb-1', 'z-10', 'relative')}>
                <span className={cn('text-[10px]', 'font-black', 'uppercase', 'tracking-widest', 'text-slate-500')}>Seat Price</span>
                <span className={cn('text-2xl', 'font-black', 'text-slate-900', 'tracking-tight', 'drop-shadow-sm')}>{selectedSeat ? formattedPrice : "₹0"}</span>
              </div>

              <button
                type="button"
                onClick={handleReserveSeat}
                disabled={!selectedSeat || isReserving}
                className={cn('w-full', 'py-3.5', 'z-10', 'relative', 'rounded-2xl', 'font-extrabold', 'text-sm', 'text-white', 'bg-blue-600', 'shadow-[0_8px_20px_rgba(37,99,235,0.2)]', 'hover:bg-blue-700', 'hover:shadow-[0_12px_24px_rgba(37,99,235,0.3)]', 'hover:scale-[1.02]', 'active:scale-[0.98]', 'transition-all', 'duration-300', 'disabled:opacity-50', 'disabled:cursor-not-allowed', 'disabled:hover:scale-100', 'disabled:hover:bg-blue-600', 'flex', 'justify-center', 'items-center')}
              >
                {isReserving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirm Selection"
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
