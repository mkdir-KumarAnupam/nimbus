"use client";

import { Search, Loader2, Plane } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function SearchButton({
                                         onClick,
                                         isLoading = false,
                                     }: SearchButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            type="button"
            className="
                group
                relative
                flex
                h-14
                w-full
                items-center
                justify-center
                rounded-full
                bg-blue-600
                px-8
                text-base
                font-bold
                text-white



                /* Tactile Hover & Press Effects */
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-blue-700
                hover:shadow-[0_12px_25px_rgb(37,99,235,0.35)]
                active:scale-[0.98]
                active:translate-y-0

                /* Accessibility */
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2

                /* Disabled State */
                disabled:pointer-events-none
                disabled:opacity-70
            "
        >
            {isLoading ? (
                <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
            ) : (
                <div className="relative mr-2.5 h-5 w-5 flex-shrink-0">
                    <Search className="absolute inset-0 h-5 w-5 transition-all duration-300 group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:opacity-0 group-hover:scale-75" />

                    <Plane className="absolute inset-0 h-5 w-5 -translate-x-3 translate-y-3 scale-75 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100" />
                </div>
            )}

            <span>
                {isLoading ? "Searching Flights..." : "Search Flights"}
            </span>
        </button>
    );
}
