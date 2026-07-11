"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Airport } from "@/types/airport";
import { useAirports } from "@/hooks/useAirport";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plane } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface AirportDialogProps {
    open: boolean;
    title: string;
    onOpenChange: (open: boolean) => void;
    onSelect: (airport: Airport) => void;
}

export default function AirportDialog({
                                          open,
                                          onOpenChange,
                                          onSelect,
                                      }: AirportDialogProps) {
    const { airports, isLoading } = useAirports();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="
                overflow-hidden
                p-0
                sm:max-w-[540px]
                sm:rounded-[2.5rem]
                border
                border-white/50
                bg-white/80
                backdrop-blur-3xl
                backdrop-saturate-200
                shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.9)]
                [&>button.absolute]:hidden
            ">
                <VisuallyHidden>
                    <DialogTitle>Select Airport</DialogTitle>
                </VisuallyHidden>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Plane className="h-8 w-8 animate-pulse text-blue-500" />
                        <p className="mt-4 text-sm font-semibold tracking-wide uppercase">
                            Loading Airports
                        </p>
                    </div>
                ) : (
                    <Command className="
                        bg-transparent
                        [&_[data-slot=command-input-wrapper]]:p-4
                        [&_[data-slot=input-group]]:h-14
                        [&_[data-slot=input-group]]:bg-white/40
                        [&_[data-slot=input-group]]:border-white/60
                        [&_[data-slot=input-group]]:backdrop-blur-md
                        [&_[data-slot=input-group]]:shadow-inner
                        [&_[data-slot=input-group]]:transition-all
                        [&_[data-slot=input-group-addon]>svg]:size-5
                    ">
                        <CommandInput
                            placeholder="Search by city, airport, or IATA code..."
                            className="h-full px-4 text-base ring-0 placeholder:text-slate-400 focus:ring-0"
                        />

                        <CommandList>
                            <CommandEmpty className="py-16 text-center text-sm font-medium text-slate-500">
                                No destinations found.
                            </CommandEmpty>

                            <ScrollArea className="h-[45vh] max-h-[420px]">
                                <CommandGroup className="p-3">
                                    {airports.map((airport) => (
                                        <CommandItem
                                            key={airport.id}
                                            value={`${airport.code} ${airport.city} ${airport.name}`}
                                            onSelect={() => {
                                                onSelect(airport);
                                                onOpenChange(false);
                                            }}
                                            className="
                                                group mb-2 flex cursor-pointer items-center justify-between gap-4
                                                rounded-2xl px-5 py-3.5
                                                bg-white/30 border border-white/20
                                                transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                                                hover:bg-white/50 hover:border-white/40
                                                data-[selected=true]:bg-white/80
                                                data-[selected=true]:border-white/60
                                                data-[selected=true]:shadow-[0_12px_30px_rgba(0,0,0,0.03)]
                                                data-[selected=true]:scale-[1.01]
                                                active:scale-[0.99]
                                            "
                                        >
                                            <div className="flex flex-1 min-w-0 items-center gap-4">
                                                {/* IATA Code */}
                                                <span className="w-12 shrink-0 text-xl font-black tracking-tight text-slate-800 transition-colors group-data-[selected=true]:text-blue-600">
                                                    {airport.code}
                                                </span>

                                                {/* Vertical Divider */}
                                                <div className="h-6 w-px bg-slate-300/40 group-data-[selected=true]:bg-blue-500/20 transition-colors" />

                                                {/* City & Airport Details */}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="truncate text-base font-bold text-slate-900">
                                                        {airport.city}
                                                    </span>
                                                    <span className="truncate text-xs font-medium text-slate-400 transition-colors group-data-[selected=true]:text-slate-500">
                                                        {airport.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Country Pill */}
                                            <div className="shrink-0 pl-2">
                                                <span className="rounded-lg bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-all group-data-[selected=true]:bg-blue-600/10 group-data-[selected=true]:text-blue-600">
                                                    {airport.country}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </ScrollArea>
                        </CommandList>
                    </Command>
                )}
            </DialogContent>
        </Dialog>
    );
}
