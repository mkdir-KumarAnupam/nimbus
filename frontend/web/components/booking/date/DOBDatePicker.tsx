"use client";

import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DOBDatePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    children: React.ReactNode;
    isExpiry?: boolean;
}

export default function DOBDatePicker({
                                       open,
                                       onOpenChange,
                                       selected,
                                       onSelect,
                                       children,
                                       isExpiry = false,
                                   }: DOBDatePickerProps) {
    const currentYear = new Date().getFullYear();
    const fromYear = isExpiry ? currentYear : 1900;
    const toYear = isExpiry ? currentYear + 20 : currentYear;

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
                    captionLayout="dropdown"
                    disabled={isExpiry ? (date) => date < new Date(new Date().setHours(0, 0, 0, 0)) : (date) => date > new Date()}
                />

                <div className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
                    {selected
                        ? format(selected, "EEEE, dd MMMM yyyy")
                        : isExpiry ? "Select expiry date" : "Select date of birth"}
                </div>
            </PopoverContent>
        </Popover>
    );
}
