import { Check } from "lucide-react";
import React from "react";
import clsx from "clsx";

export type StepId = "search" | "flight" | "seat" | "passenger" | "payment";

interface BreadcrumbProps {
  currentStep: StepId;
}

const steps = [
  { id: "search", label: "Search" },
  { id: "flight", label: "Flight" },
  { id: "seat", label: "Seat" },
  { id: "passenger", label: "Passenger" },
  { id: "payment", label: "Payment" },
];

export default function Breadcrumb({ currentStep }: BreadcrumbProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-6 w-full max-w-4xl mx-auto text-[10px] sm:text-xs font-black uppercase tracking-widest relative">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div
              className={clsx(
                "flex items-center gap-1.5",
                isCompleted && "text-slate-800",
                isCurrent && "text-blue-600",
                isUpcoming && "text-slate-400"
              )}
            >
              {isCompleted && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-3 w-3" />
                </div>
              )}
              {isCurrent && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
              <span>{step.label}</span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="h-px w-4 sm:w-8 bg-slate-300" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
