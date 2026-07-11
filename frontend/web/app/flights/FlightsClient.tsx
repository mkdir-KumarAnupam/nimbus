"use client";

import { useState, useEffect } from "react";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { FlightSearchRequest } from "@/types/flight";
import FlightList from "./FlightList";
import NoFlights from "./NoFlight";
import FlightSkeleton from "./FlightSkeleton";
import { SlidersHorizontal, ArrowUpDown, Clock, RotateCcw, ArrowLeft, Search, Briefcase, Luggage, Plane } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import AirportDialog from "@/components/airports/AirportDialogue";
import { useAirports } from "@/hooks/useAirport";
import { useRouter } from "next/navigation";
import { Airport } from "@/types/airport";
import { CabinClass, PassengerState } from "@/types/passenger";
import { format } from "date-fns";

const AIRPORT_CITIES: Record<string, string> = {
  DEL: "Delhi",
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

const CABIN_LABELS = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
} as const;

const CABIN_CLASSES = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
] as const;

interface FlightsClientProps {
  searchParams: {
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
    cabin?: string;
  };
}

export default function FlightsClient({
  searchParams,
}: FlightsClientProps) {
  const router = useRouter();

  if (
    !searchParams.from ||
    !searchParams.to ||
    !searchParams.date ||
    !searchParams.passengers ||
    !searchParams.cabin
  ) {
    return <div>Invalid search.</div>;
  }

  const departureDateObj = new Date(searchParams.date);

  const departureDateUtc = new Date(
    Date.UTC(
      departureDateObj.getFullYear(),
      departureDateObj.getMonth(),
      departureDateObj.getDate(),
    ),
  );

  const request: FlightSearchRequest = {
    departureAirportCode: searchParams.from,
    arrivalAirportCode: searchParams.to,
    departureDate: departureDateUtc.toISOString(),
    passengers: Number(searchParams.passengers),
    cabinClass: searchParams.cabin as FlightSearchRequest["cabinClass"],
  };

  const {
    mutate,
    data,
    isPending,
    error,
  } = useFlightSearch();

  // Airports list for lookup and selection
  const { airports } = useAirports();

  // Search topbar states
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(departureDateObj);
  const [passengers, setPassengers] = useState<PassengerState>({
    adults: Number(searchParams.passengers) || 1,
    children: 0,
    infants: 0,
    cabinClass: (searchParams.cabin as CabinClass) || "economy",
  });

  // Popover open states
  const [openDate, setOpenDate] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);
  const [openPicker, setOpenPicker] = useState<"departureAirport" | "arrivalAirport" | null>(null);

  // Sync search parameters to states on change or airports load
  useEffect(() => {
    if (airports.length > 0) {
      const dep = airports.find((a) => a.code === searchParams.from) || null;
      const arr = airports.find((a) => a.code === searchParams.to) || null;
      setDepartureAirport(dep);
      setArrivalAirport(arr);
    }
  }, [airports, searchParams.from, searchParams.to]);

  useEffect(() => {
    setDepartureDate(new Date(searchParams.date || ""));
    setPassengers({
      adults: Number(searchParams.passengers) || 1,
      children: 0,
      infants: 0,
      cabinClass: (searchParams.cabin as CabinClass) || "economy",
    });
  }, [searchParams.date, searchParams.passengers, searchParams.cabin]);

  // Filter & Sort States
  const [sortBy, setSortBy] = useState<"price" | "duration" | "time">("price");
  const [earliestHour, setEarliestHour] = useState<number>(0);
  const [maxDurationHours, setMaxDurationHours] = useState<number>(24);

  // Trigger search mutation
  useEffect(() => {
    mutate(request);
  }, [mutate, searchParams.from, searchParams.to, searchParams.date, searchParams.passengers, searchParams.cabin]);

  const handleReset = () => {
    setSortBy("price");
    setEarliestHour(0);
    setMaxDurationHours(24);
  };

  const handleSearch = () => {
    if (!departureAirport) return;
    if (!arrivalAirport) return;
    if (!departureDate) return;

    if (departureAirport.code === arrivalAirport.code) {
      return;
    }

    router.push(
      `/flights?from=${departureAirport.code}` +
      `&to=${arrivalAirport.code}` +
      `&date=${format(departureDate, "yyyy-MM-dd")}` +
      `&passengers=${passengers.adults + passengers.children + passengers.infants}` +
      `&cabin=${passengers.cabinClass}`
    );
  };

  if (isPending) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded-lg bg-slate-200" />
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Skeleton */}
            <div className="h-96 rounded-[2rem] bg-white/50 border border-white/40 animate-pulse" />
            {/* Flight Cards Skeletons */}
            <div className="space-y-4">
              <FlightSkeleton />
              <FlightSkeleton />
              <FlightSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return <div>Failed to load flights.</div>;
  }

  // Apply filters in-memory
  const filteredFlights = (data ?? []).filter((flight) => {
    // 1. Earliest hour filter
    const depHour = new Date(flight.departureTime).getHours();
    if (depHour < earliestHour) return false;

    // 2. Max duration filter
    const durationHours = flight.durationMinutes / 60;
    if (durationHours > maxDurationHours) return false;

    return true;
  });

  // Apply sorting
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === "price") {
      return a.lowestPrice - b.lowestPrice;
    }
    if (sortBy === "duration") {
      return a.durationMinutes - b.durationMinutes;
    }
    if (sortBy === "time") {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    }
    return 0;
  });

  return (
    <main className="relative min-h-screen bg-slate-100 pb-20">
      {/* Super lightweight, hardware-accelerated static background gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-blue-50/20 to-indigo-50/15 pointer-events-none select-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="group mb-6 flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 bg-white/70 border border-white/60 rounded-full hover:bg-white transition-all select-none cursor-pointer w-fit shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Search</span>
        </button>

        {/* Minified Search Form Topbar */}
        <div className="mb-8 w-full p-2 bg-white/80 backdrop-blur-2xl rounded-full border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between gap-2 flex-wrap md:flex-nowrap">
          {/* From Airport */}
          <button
            type="button"
            onClick={() => setOpenPicker("departureAirport")}
            className="flex-1 min-w-[120px] text-left px-5 py-2 hover:bg-slate-100/50 rounded-full transition-all flex flex-col cursor-pointer border border-transparent hover:border-slate-200/30"
          >
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">From</span>
            <span className="text-sm font-extrabold text-slate-800 truncate">
              {departureAirport ? `${departureAirport.city} (${departureAirport.code})` : "Select departure"}
            </span>
          </button>

          <div className="hidden md:block h-6 w-px bg-slate-200/80" />

          {/* To Airport */}
          <button
            type="button"
            onClick={() => setOpenPicker("arrivalAirport")}
            className="flex-1 min-w-[120px] text-left px-5 py-2 hover:bg-slate-100/50 rounded-full transition-all flex flex-col cursor-pointer border border-transparent hover:border-slate-200/30"
          >
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">To</span>
            <span className="text-sm font-extrabold text-slate-800 truncate">
              {arrivalAirport ? `${arrivalAirport.city} (${arrivalAirport.code})` : "Select destination"}
            </span>
          </button>

          <div className="hidden md:block h-6 w-px bg-slate-200/80" />

          {/* Date Selector */}
          <div className="flex-1 min-w-[110px]">
            <Popover open={openDate} onOpenChange={setOpenDate}>
              <PopoverTrigger className="text-left px-5 py-2 hover:bg-slate-100/50 rounded-full transition-all flex flex-col cursor-pointer border border-transparent hover:border-slate-200/30 w-full">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Departure</span>
                <span className="text-sm font-extrabold text-slate-800 truncate">
                  {departureDate ? format(departureDate, "dd MMM yyyy") : "Select date"}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl border border-white/40">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={(date) => {
                    setDepartureDate(date);
                    setOpenDate(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200/80" />

          {/* Passengers Selector */}
          <div className="flex-1 min-w-[140px]">
            <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
              <PopoverTrigger className="text-left px-5 py-2 hover:bg-slate-100/50 rounded-full transition-all flex flex-col cursor-pointer border border-transparent hover:border-slate-200/30 w-full">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Travellers</span>
                <span className="text-sm font-extrabold text-slate-800 truncate">
                  {passengers.adults + passengers.children + passengers.infants} Pax • {CABIN_LABELS[passengers.cabinClass]}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 rounded-[1.75rem] p-4 border border-white/50 bg-white/85 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                <h3 className="text-sm font-bold text-slate-900">Cabin Class</h3>
                <RadioGroup
                  value={passengers.cabinClass}
                  onValueChange={(selected) => {
                    setPassengers({
                      ...passengers,
                      cabinClass: selected as CabinClass,
                    });
                    setOpenPassengers(false);
                  }}
                  className="mt-3 space-y-1"
                >
                  {CABIN_CLASSES.map((cabin) => (
                    <div
                      key={cabin.value}
                      className="flex items-center justify-between rounded-xl px-2.5 py-1.5 transition-colors hover:bg-slate-100/50"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          id={cabin.value}
                          value={cabin.value}
                          className="border-slate-300"
                        />
                        <Label htmlFor={cabin.value} className="cursor-pointer text-sm font-semibold text-slate-750">
                          {cabin.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                <Separator className="my-3.5 bg-slate-200/60" />
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Cabin to Update Search
                </p>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Action */}
          <button
            type="button"
            onClick={handleSearch}
            className="shrink-0 h-12 w-12 md:w-auto md:px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md select-none cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
          >
            <Search className="h-4.5 w-4.5" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        {/* Airport Select Dialogues */}
        <AirportDialog
          title="Select Departure Airport"
          open={openPicker === "departureAirport"}
          onOpenChange={(open) => setOpenPicker(open ? "departureAirport" : null)}
          onSelect={setDepartureAirport}
        />
        <AirportDialog
          title="Select Arrival Airport"
          open={openPicker === "arrivalAirport"}
          onOpenChange={(open) => setOpenPicker(open ? "arrivalAirport" : null)}
          onSelect={setArrivalAirport}
        />

        {/* Header Layout */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Available Flights
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {AIRPORT_CITIES[searchParams.from] || searchParams.from}
            </span>
            <span className="text-xl font-bold text-slate-400">→</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {AIRPORT_CITIES[searchParams.to] || searchParams.to}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>{format(departureDateObj, "dd MMM yyyy")}</span>
            <span className="text-slate-300 font-normal">•</span>
            <span>
              {searchParams.passengers} {searchParams.passengers === "1" ? "Passenger" : "Passengers"}
            </span>
            <span className="text-slate-300 font-normal">•</span>
            <span>{CABIN_LABELS[searchParams.cabin as CabinClass] || searchParams.cabin}</span>
            <span className="text-slate-300 font-normal">•</span>
            <span className="text-blue-600 font-black">
              {sortedFlights.length} {sortedFlights.length === 1 ? "Flight" : "Flights"} Available
            </span>
          </div>
        </header>

        {/* Main Content Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* Sidebar Filters */}
          <aside className="
            sticky
            top-6
            z-20
            self-start
            p-5
            rounded-[2rem]
            bg-white/80
            backdrop-blur-3xl
            backdrop-saturate-200
            border
            border-white/60
            shadow-[0_15px_35px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)]
            flex
            flex-col
            gap-6
            h-fit
          ">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-900">
                <SlidersHorizontal className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-base font-black">Filters & Sort</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-700 select-none cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Sorting Widget */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Sort Options
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy("price")}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer ${sortBy === "price"
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white/50 border-slate-300 text-slate-800 hover:bg-white hover:border-slate-400"
                    }`}
                >
                  <span>Cheapest first</span>
                  <span className="opacity-75 font-black text-sm">₹</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy("duration")}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer ${sortBy === "duration"
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white/50 border-slate-300 text-slate-800 hover:bg-white hover:border-slate-400"
                    }`}
                >
                  <span>Fastest first</span>
                  <Clock className="h-3.5 w-3.5 opacity-75" />
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy("time")}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all select-none cursor-pointer ${sortBy === "time"
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white/50 border-slate-300 text-slate-800 hover:bg-white hover:border-slate-400"
                    }`}
                >
                  <span>Earliest departure</span>
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-75" />
                </button>
              </div>
            </div>

            {/* Departure Hour Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Outbound Departure
                </span>
                <span className="text-[11px] font-black text-blue-600">
                  {earliestHour === 0 ? "Anytime" : `After ${String(earliestHour).padStart(2, "0")}:00`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={earliestHour}
                onChange={(e) => setEarliestHour(Number(e.target.value))}
                className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <span>00:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Max Duration Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Max Duration
                </span>
                <span className="text-[11px] font-black text-blue-600">
                  {maxDurationHours === 24 ? "Any duration" : `Under ${maxDurationHours}h`}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="24"
                value={maxDurationHours}
                onChange={(e) => setMaxDurationHours(Number(e.target.value))}
                className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <span>2 hours</span>
                <span>24 hours</span>
              </div>
            </div>

          </aside>

          {/* Flights list panel */}
          <div className="flex-1">
            {sortedFlights.length > 0 ? (
              <FlightList flights={sortedFlights} />
            ) : (
              <NoFlights />
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
