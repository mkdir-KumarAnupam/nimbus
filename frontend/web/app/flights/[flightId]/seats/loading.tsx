import React from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function LoadingSeats() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50 font-sans pb-20 selection:bg-blue-200">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full bg-emerald-50/40 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-6 animate-pulse flex flex-col gap-8">
        
        {/* Top Header Skeleton */}
        <div className="relative flex flex-col gap-6 w-full">
          <Breadcrumb currentStep="seat" />
        </div>

        {/* Main Selection Area Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-10 mt-4">
          
          {/* Left Sidebar Skeleton */}
          <div className="w-full lg:w-40 xl:w-48 shrink-0 flex flex-col gap-6 sticky top-6">
            <div className="h-12 w-full bg-white/40 rounded-[1.25rem] backdrop-blur-md" />
            <div className="h-48 w-full bg-white/40 rounded-[2.5rem] backdrop-blur-md" />
          </div>

          {/* Center Airplane Map Skeleton */}
          <div className="flex-1 flex flex-col items-center border-x border-slate-200/50 px-4">
            <div className="mb-8 flex flex-col items-center gap-2">
              <div className="h-8 w-48 bg-slate-200/60 rounded-lg" />
              <div className="h-4 w-64 bg-slate-200/40 rounded-lg" />
            </div>
            
            {/* Plane Skeleton */}
            <div className="w-full max-w-sm h-[600px] bg-white/40 rounded-[3rem] border border-white/60 shadow-[inset_0_2px_10px_rgba(255,255,255,1)]" />
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 sticky top-6">
            <div className="h-40 w-full bg-white/40 rounded-[2.5rem] backdrop-blur-md" />
            <div className="h-56 w-full bg-white/50 rounded-[2.5rem] backdrop-blur-md" />
          </div>

        </div>
      </div>
    </main>
  );
}
