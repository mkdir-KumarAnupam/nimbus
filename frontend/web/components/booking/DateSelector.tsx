"use client";

import { format } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateSelectorProps {
    label: string;
    value?: Date;
    minDate?: Date;
    onChange?: (date: Date | undefined) => void;
}

export default function DateSelector({
                                         label,
                                         value,
                                         minDate,
                                         onChange,
                                     }: DateSelectorProps) {
    const date = value ? format(value, "dd MMM") : undefined;
    const day = value ? format(value, "EEEE") : undefined;

    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                type="button"
                onClick={() => setOpen(true)}
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
                    hover:z-10
                    hover:bg-white/60
                    hover:-translate-y-1
                    hover:scale-[1.015]
                    hover:rounded-2xl
                    hover:border-transparent
                    hover:ring-1
                    hover:ring-blue-400/50
                    hover:shadow-[0_12px_40px_rgb(37,99,235,0.15)]
                    focus:outline-none
                    focus-visible:z-10
                    focus-visible:ring-2
                    focus-visible:ring-blue-500
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
                <div className="mt-auto flex w-full flex-col items-start pt-4">
                    {date ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-black leading-none tracking-tighter text-slate-900 transition-colors duration-300 group-hover:text-blue-950">
                                    {date}
                                </h2>
                            </div>

                            <div className="mt-2 flex items-center gap-1.5">
                                {/* Calendar icon scales up subtly on hover */}
                                <CalendarDays className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" />
                                <p className="text-base font-bold text-slate-800">
                                    {day}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                {/* Empty state icon lifts on hover */}
                                <CalendarDays className="h-7 w-7 text-slate-200 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-blue-400 group-hover:-translate-y-1" />
                                <span className="text-2xl font-bold text-slate-300 transition-colors duration-300 group-hover:text-slate-500">
                                    Select Date
                                </span>
                            </div>

                            <p className="mt-2 text-sm font-medium text-slate-400">
                                Choose your travel dates
                            </p>
                        </>
                    )}
                </div>
            </PopoverTrigger>

            {/* Frosted glass popover */}
            <PopoverContent
                align="start"
                sideOffset={16} // Slightly more offset so it detaches from the button beautifully
                className="
                    z-50
                    w-auto
                    rounded-[2rem]
                    p-3
                    border border-white/40
                    bg-white/20
                    backdrop-blur-3xl
                    backdrop-saturate-200
                    shadow-[0_30px_60px_rgba(37,99,235,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)]
                    /* Added subtle entrance animation for the popover */
                    data-[state=open]:animate-in
                    data-[state=closed]:animate-out
                    data-[state=closed]:fade-out-0
                    data-[state=open]:fade-in-0
                    data-[state=closed]:zoom-out-95
                    data-[state=open]:zoom-in-95
                "
            >
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                        onChange?.(date);
                        if (date) {
                            setOpen(false);
                        }
                    }}
                    // Force the calendar base to be transparent so the glass shows through
                    className="bg-transparent"
                    disabled={(currentDate) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (minDate) {
                            const normalizedMinDate = new Date(minDate);
                            normalizedMinDate.setHours(0, 0, 0, 0);
                            return currentDate < normalizedMinDate;
                        }

                        return currentDate < today;
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}