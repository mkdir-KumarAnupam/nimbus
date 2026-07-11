"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import TripTypeSelector, {
    TripType,
} from "./TripTypeSelector";

export default function FlightSearchCard() {
    const [tripType, setTripType] =
        useState<TripType>("one-way");

    return (
        <Card className="mx-auto mt-12 w-full max-w-7xl rounded-3xl border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-8 py-6">
                <TripTypeSelector
                    value={tripType}
                    onValueChange={setTripType}
                />

                <button className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                    INR
                </button>
            </div>

            <div className="h-44 flex items-center justify-center text-muted-foreground">
                Flight search fields go here...
            </div>
        </Card>
    );
}