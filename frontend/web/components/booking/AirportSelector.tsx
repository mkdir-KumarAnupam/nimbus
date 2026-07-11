"use client";

import { ChevronDown, MapPin, PlaneTakeoff } from "lucide-react";

import { Airport } from "@/types/airport";

interface AirportSelectorProps {
    label: string;
    airport: Airport | null;
    onClick?: () => void;
}

export default function AirportSelector({
                                            label,
                                            airport,
                                            onClick,
                                        }: AirportSelectorProps) {
    return (
        <button
            onClick={onClick}
            type="button"
            className="
                group
                relative
                flex
                h-full
                w-full
                flex-col
                justify-between
                bg-transparent
                border-r
                border-slate-300/40
                p-6
                text-left
                cursor-pointer
                transition-all
                duration-500
                ease-[cubic-bezier(0.23,1,0.32,1)]

                /* PREMIUM HOVER EFFECTS */
                hover:z-10
                hover:bg-white/60
                hover:-translate-y-1
                hover:scale-[1.015] /* Micro-scale makes it feel 3D */
                hover:rounded-2xl
                hover:border-transparent
                hover:ring-1
                hover:ring-blue-400/50
                hover:shadow-[0_12px_40px_rgb(37,99,235,0.15)] /* Softer, wider glow */

                /* Accessibility & Active States */
                focus:outline-none
                focus-visible:z-10
                focus-visible:ring-2
                focus-visible:ring-blue-500

                /* Active state should snap fast (duration-150) so it feels responsive */
                active:duration-150
                active:scale-[0.98]
                active:bg-white/70
                active:translate-y-0
                active:shadow-sm
            "
        >
            {/* 1. TOP ANCHOR: Label & Chevron */}
            <div className="flex w-full items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors duration-300 group-hover:text-blue-700">
                    {label}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-blue-700 group-hover:translate-y-0.5" />
            </div>

            {/* 2. BOTTOM ANCHOR: Content Area */}
            <div className="mt-auto flex w-full min-w-0 flex-col items-start pt-4 overflow-hidden">
                {airport?.code ? (
                    <>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter text-slate-900 transition-colors duration-300 group-hover:text-blue-950">
                                {airport.code}
                            </span>
                        </div>
 
                        <div className="mt-2 flex items-center gap-1.5 w-full min-w-0">
                            <MapPin className="h-4 w-4 shrink-0 text-blue-600 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" />
                            <p className="text-lg font-bold text-slate-800 truncate w-full block">
                                {airport.city}
                            </p>
                        </div>
 
                        <p className="mt-1 truncate text-sm font-medium text-slate-500 w-full block">
                            {airport.name}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            {/* Plane icon now gently lifts off on hover */}
                            <PlaneTakeoff className="h-8 w-8 text-slate-200 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-blue-400 group-hover:-translate-y-1 group-hover:translate-x-1" />
                            <span className="text-2xl font-bold text-slate-300 transition-colors duration-300 group-hover:text-slate-500">
                                Select Airport
                            </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-slate-400">
                            Search by city or airport code
                        </p>
                    </>
                )}
            </div>
        </button>
    );
}
