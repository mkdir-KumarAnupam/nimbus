"use client";

import AirportSelector from "@/components/booking/AirportSelector";
import DateSelector from "@/components/booking/DateSelector";
import PassengerSelector from "@/components/booking/PassengerSelector";
import SearchButton from "@/components/booking/SearchButton";
import SwapAirportsButton from "@/components/booking/SwapAirportsButton";
import { useState } from "react";
import { Airport } from "@/types/airport";
import AirportDialog from "@/components/airports/AirportDialogue";
import { format } from "date-fns";
import { PassengerState } from "@/types/passenger";
import { useRouter } from "next/navigation"


export function SearchForm() {

  const router = useRouter();

  type OpenPicker =
    | "departureAirport"
    | "arrivalAirport"
    | "departureDate"
    | null;

  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date>();

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  const [rotationDegrees, setRotationDegrees] = useState(0);

  const handleSwapAirports = () => {
    setDepartureAirport(arrivalAirport);
    setArrivalAirport(departureAirport);
    setRotationDegrees((prev) => prev + 180);
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
      `&passengers=${passengers.adults +
      passengers.children +
      passengers.infants
      }` +
      `&cabin=${passengers.cabinClass}`
    );
  };


  const [passengers, setPassengers] = useState<PassengerState>({
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "economy",
  });

  return (
    <div
      className="
                relative
                mx-auto
                w-full
                overflow-hidden
                rounded-[2.5rem]
                border
                border-white/60
                bg-white/75
                pb-8
                pt-6
                px-6
                backdrop-blur-2xl
                shadow-[0_20px_40px_rgb(0,0,0,0.08)]
                ring-1
                ring-black/5

            "
    >

      <div className="relative">
        <div className="grid grid-cols-[1.3fr_1.3fr_1fr_1fr] relative z-10">

          <div className="relative min-w-0">
            <AirportSelector
              label="From"
              airport={departureAirport}
              onClick={() => setOpenPicker("departureAirport")}
            />
            {/* Floating swap button centered on the boundary between From and To */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
              <div
                className="transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${rotationDegrees}deg)` }}
              >
                <SwapAirportsButton onClick={handleSwapAirports} />
              </div>
            </div>
          </div>

          <div className="relative min-w-0">
            <AirportSelector
              label="To"
              airport={arrivalAirport}
              onClick={() => setOpenPicker("arrivalAirport")}
            />
          </div>

          <div className="relative min-w-0">
            <DateSelector
              label="Departure"
              value={departureDate}
              onChange={setDepartureDate}
            />
          </div>

          <div className="relative min-w-0">
            <PassengerSelector
              value={passengers}
              onChange={setPassengers}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 px-6">
        <div className="mx-auto max-w-lg">
          <SearchButton onClick={handleSearch} />
        </div>
      </div>
      <AirportDialog
        title="Select Departure Airport"
        open={openPicker === "departureAirport"}
        onOpenChange={(open) =>
          setOpenPicker(open ? "departureAirport" : null)
        }
        onSelect={setDepartureAirport}
      />

      <AirportDialog
        title="Select Arrival Airport"
        open={openPicker === "arrivalAirport"}
        onOpenChange={(open) =>
          setOpenPicker(open ? "arrivalAirport" : null)
        }
        onSelect={setArrivalAirport}
      />
    </div>
  );
}
