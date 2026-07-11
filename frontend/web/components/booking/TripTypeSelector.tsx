"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type TripType = "one-way" | "round-trip" | "multi-city";

interface TripTypeSelectorProps {
    value: TripType;
    onValueChange: (value: TripType) => void;
}

const options: {
    label: string;
    value: TripType;
}[] = [
    {
        label: "One Way",
        value: "one-way",
    },
    {
        label: "Round Trip",
        value: "round-trip",
    },
    {
        label: "Multi City",
        value: "multi-city",
    },
];

export default function TripTypeSelector({
                                             value,
                                             onValueChange,
                                         }: TripTypeSelectorProps) {
    return (
        <RadioGroup
            value={value}
            onValueChange={(value) =>
                onValueChange(value as TripType)
            }
            className="flex items-center gap-8"
        >
            {options.map((option) => (
                <div
                    key={option.value}
                    className="flex items-center space-x-2"
                >
                    <RadioGroupItem
                        value={option.value}
                        id={option.value}
                    />

                    <Label
                        htmlFor={option.value}
                        className="cursor-pointer text-base font-medium"
                    >
                        {option.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    );
}