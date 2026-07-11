"use client";

import { ArrowLeftRight } from "lucide-react";

interface SwapAirportsButtonProps {
    onClick?: () => void;
}

export default function SwapAirportsButton({
                                               onClick,
                                           }: SwapAirportsButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-md transition hover:scale-105 z-10 hover:outline-2 hover:outline-blue-400"
        >
            <ArrowLeftRight className="h-5 w-5" />
        </button>
    );
}