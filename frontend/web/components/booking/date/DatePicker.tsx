"use client";

import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    children: React.ReactNode;
}

export default function DatePicker({
                                       open,
                                       onOpenChange,
                                       selected,
                                       onSelect,
                                       children,
                                   }: DatePickerProps) {
    return (
        <Popover
            open={open}
            onOpenChange={onOpenChange}
        >
            <PopoverTrigger render={children as React.ReactElement} />

            <PopoverContent
                className="w-auto rounded-3xl border p-0 shadow-xl"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        onSelect(date);
                        if (date) {
                            onOpenChange(false);
                        }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />

                <div className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
                    {selected
                        ? format(selected, "EEEE, dd MMMM yyyy")
                        : "Select a travel date"}
                </div>
            </PopoverContent>
        </Popover>
    );
}
