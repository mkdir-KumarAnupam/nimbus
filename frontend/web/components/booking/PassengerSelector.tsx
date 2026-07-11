"use client";

import {
    ChevronDown,
    Minus,
    Plus,
    Users,
} from "lucide-react";

import { useState } from "react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CabinClass, PassengerState } from "@/types/passenger";

interface PassengerSelectorProps {
    value: PassengerState;
    onChange: (value: PassengerState) => void;
}

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

export default function PassengerSelector({
    value,
    onChange,
}: PassengerSelectorProps) {
    const totalPassengers =
        value.adults +
        value.children +
        value.infants;

    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
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
                <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors duration-300 group-hover:text-blue-700">
                        Travellers
                    </span>

                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-blue-700 group-hover:translate-y-0.5" />
                </div>

                <div className="mt-auto flex w-full flex-col items-start pt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black leading-none tracking-tighter text-slate-900 transition-colors duration-300 group-hover:text-blue-950">
                            {totalPassengers}
                        </span>

                        <span className="text-xl font-bold tracking-tight text-slate-800">
                            {totalPassengers === 1 ? "Passenger" : "Passengers"}
                        </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" />

                        <p className="text-base font-bold text-slate-800">
                            {CABIN_LABELS[value.cabinClass]}
                        </p>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={12}
                className="
                    w-72
                    rounded-[1.75rem]
                    p-4
                    border
                    border-white/50
                    bg-white/80
                    backdrop-blur-3xl
                    backdrop-saturate-200
                    shadow-[0_30px_60px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)]
                "
            >
                <h3 className="text-base font-bold text-slate-900">Passengers</h3>

                <div className="mt-4 space-y-3">
                    {[
                        ["Adults", value.adults],
                        ["Children", value.children],
                        ["Infants", value.infants],
                    ].map(([label, count]) => (
                        <div key={String(label)} className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">{label}</span>

                            <div className="flex items-center gap-2 opacity-50">
                                <Button variant="outline" size="icon" disabled className="h-8 w-8 rounded-lg">
                                    <Minus className="h-3.5 w-3.5" />
                                </Button>

                                <span className="w-5 text-center text-sm font-bold text-slate-800">{count}</span>

                                <Button variant="outline" size="icon" disabled className="h-8 w-8 rounded-lg">
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className="my-4 bg-slate-200/60" />

                <h3 className="mb-2 text-base font-bold text-slate-900">Cabin Class</h3>

                <RadioGroup
                    value={value.cabinClass}
                    onValueChange={(selected) => {
                        onChange({
                            ...value,
                            cabinClass: selected as CabinClass,
                        });
                        setOpen(false);
                    }}
                    className="space-y-1"
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
                                <Label htmlFor={cabin.value} className="cursor-pointer text-sm font-semibold text-slate-700">
                                    {cabin.label}
                                </Label>
                            </div>
                        </div>
                    ))}
                </RadioGroup>

                <p className="mt-4 text-center text-[10px] font-semibold text-slate-400">
                    Passenger count customization will be available soon.
                </p>
            </PopoverContent>
        </Popover>
    );
}