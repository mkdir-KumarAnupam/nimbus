"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Globe, CreditCard, Flag, FileText, ChevronRight, ArrowLeft, Plane, Calendar, Check, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import Breadcrumb from "@/components/Breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/store/auth";
import { useBookingStore } from "@/store/booking";
import { useFlight } from "@/hooks/useFlight";
import { useFlightSeats } from "@/hooks/useFlightSeats";
import { useAirports } from "@/hooks/useAirport";
import { format } from "date-fns";
import { createPassenger } from "@/services/passenger";
import { cancelReservation } from "@/services/reservation";
import { getSavedPassengers } from "@/services/savedPassenger";
import { SavedPassenger } from "@/types/passenger";
import DOBDatePicker from "@/components/booking/date/DOBDatePicker";
import { COUNTRIES } from "@/lib/countries";

const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other"], { message: "Gender is required" }),
  dateOfBirth: z.date({ message: "Date of birth is required" }),
  nationality: z.string().min(1, "Nationality is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),

  passportNumber: z.string().optional(),
  passportExpiry: z.date().optional(),
  passportCountry: z.string().optional(),

  mealPreference: z.string().optional(),
  specialAssistance: z.string().optional(),
  frequentFlyerNumber: z.string().optional(),
});

type PassengerFormValues = z.infer<typeof passengerSchema>;



const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!expiresAt) return;
    let hasExpired = false;
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        if (!hasExpired) {
          hasExpired = true;
          setTimeLeft("Expired");
          toast.error("Seat expiration expired");
          router.push("/");
        }
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) return null;

  return (
    <div className="relative w-full flex items-center justify-between gap-3 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 backdrop-blur-2xl backdrop-saturate-200 border border-white/60 px-5 py-4 rounded-[2rem] shadow-[0_8px_32px_rgba(59,130,246,0.1),inset_0_2px_10px_rgba(255,255,255,0.8)] overflow-hidden group">
      <div className="absolute inset-0 bg-white/20 blur-xl group-hover:opacity-100 opacity-50 transition-opacity duration-1000" />
      <div className="absolute inset-[-50%] bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      
      <div className="flex flex-col z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seat Reserved</span>
        <span className="text-sm font-bold text-slate-800 -mt-0.5">Hold Expires In</span>
      </div>
      <div className="z-10 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]">
        <span className="text-lg font-black text-blue-600 tracking-tight tabular-nums">{timeLeft}</span>
      </div>
    </div>
  );
};

export default function PassengerPage() {


  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [expiryPickerOpen, setExpiryPickerOpen] = useState(false);
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [showPassportCountryDropdown, setShowPassportCountryDropdown] = useState(false);
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);

  // Auth Store
  const { user } = useAuthStore();

  // Zustand Store
  const reservation = useBookingStore((state) => state.reservation);
  const setPassenger = useBookingStore((state) => state.setPassenger);

  // Queries for the summary pane
  const { data: flight, isLoading: isFlightLoading } = useFlight(reservation?.flightId || "");
  const { data: seats, isLoading: isSeatsLoading } = useFlightSeats(reservation?.flightId || "");
  const { airports, isLoading: isAirportsLoading } = useAirports();

  const selectedSeat = seats?.find(s => s.id === reservation?.flightSeatId);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      gender: "male",
      specialAssistance: "no",
      mealPreference: "Standard",
    },
  });

  useEffect(() => {
    if (user) {
      getSavedPassengers()
        .then((data) => setSavedPassengers(data || []))
        .catch((err) => {
          console.error("Failed to fetch saved passengers:", err);
        });
    }
  }, [user]);

  const handleQuickFill = (p: SavedPassenger) => {
    setValue("firstName", p.firstName, { shouldValidate: true });
    setValue("lastName", p.lastName, { shouldValidate: true });
    setValue("gender", p.gender as any, { shouldValidate: true });
    setValue("dateOfBirth", new Date(p.dateOfBirth), { shouldValidate: true });
    setValue("nationality", p.nationality, { shouldValidate: true });
    setValue("email", p.email, { shouldValidate: true });
    setValue("phone", p.phone, { shouldValidate: true });
    if (p.passportNumber) setValue("passportNumber", p.passportNumber, { shouldValidate: true });
    if (p.passportExpiry) setValue("passportExpiry", new Date(p.passportExpiry), { shouldValidate: true });
    if (p.passportCountry) setValue("passportCountry", p.passportCountry, { shouldValidate: true });
    if (p.mealPreference) setValue("mealPreference", p.mealPreference, { shouldValidate: true });
    if (p.specialAssistance) setValue("specialAssistance", p.specialAssistance, { shouldValidate: true });
    if (p.frequentFlyerNumber) setValue("frequentFlyerNumber", p.frequentFlyerNumber, { shouldValidate: true });
    toast.success(`Autofilled details for ${p.firstName}`);
  };       

  const dobValue = watch("dateOfBirth");
  const expiryValue = watch("passportExpiry");
  const nationalityValue = watch("nationality");
  const passportCountryValue = watch("passportCountry");
  const mealValue = watch("mealPreference");
  const specialAssistanceValue = watch("specialAssistance");

  const filteredNationalities = COUNTRIES.filter(c => c.toLowerCase().includes((nationalityValue || "").toLowerCase())).slice(0, 5);
  const filteredPassportCountries = COUNTRIES.filter(c => c.toLowerCase().includes((passportCountryValue || "").toLowerCase())).slice(0, 5);

  const originAirport = airports.find((a) => a.id === flight?.originAirportId);
  const destinationAirport = airports.find((a) => a.id === flight?.destinationAirportId);
  const isInternational = originAirport?.country && destinationAirport?.country && originAirport.country !== destinationAirport.country;

  const [currentStep, setCurrentStep] = useState(1);


  const stepsList = [
    { id: 1, title: "Personal" },
    { id: 2, title: "Contact" },
    ...(isInternational ? [{ id: 3, title: "Passport" }] : []),
    { id: 4, title: "Extras" }
  ];

  useEffect(() => {
    if (!isInternational && currentStep === 3) {
      setCurrentStep(4);
    }
  }, [isInternational, currentStep]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof PassengerFormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = ["firstName", "lastName", "gender", "dateOfBirth"];
    if (currentStep === 2) fieldsToValidate = ["nationality", "email", "phone"];
    if (currentStep === 3) fieldsToValidate = ["passportNumber", "passportExpiry", "passportCountry"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      const currentIdx = stepsList.findIndex(s => s.id === currentStep);
      if (currentIdx < stepsList.length - 1) {
        setCurrentStep(stepsList[currentIdx + 1].id);
      }
    }
  };

  const handlePrev = () => {
    const currentIdx = stepsList.findIndex(s => s.id === currentStep);
    if (currentIdx > 0) {
      setCurrentStep(stepsList[currentIdx - 1].id);
    }
  };


  // Redirect if no reservation exists
  useEffect(() => {
    if (!reservation) {
      toast.error("No active reservation found. Please start a new booking.");
      router.push("/");
    }
  }, [reservation, router]);

  useEffect(() => {
    if (!reservation) return;

    const handleBeforeUnload = () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api/v1'}/reservations/${reservation.id}/user/${reservation.userId}`;
      navigator.sendBeacon(url);
    };

    const handlePopState = () => {
      cancelReservation(reservation.id, reservation.userId).catch(() => {});
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [reservation]);

  const handleBack = async () => {
    if (reservation) {
      try {
        await cancelReservation(reservation.id, reservation.userId);
      } catch (e) {
        // Ignore errors
      }
    }
    router.back();
  };

  const onSubmit = async (data: PassengerFormValues) => {
    if (!reservation) return;

    setIsSaving(true);
    try {
      // Call createPassenger service
      const passenger = await createPassenger(reservation.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth.toISOString(),
        nationality: data.nationality,
        email: data.email,
        phone: data.phone,
        passportNumber: data.passportNumber || undefined,
        passportExpiry: data.passportExpiry ? data.passportExpiry.toISOString() : undefined,
        passportCountry: data.passportCountry || undefined,
        mealPreference: data.mealPreference || undefined,
        specialAssistance: data.specialAssistance || undefined,
        frequentFlyerNumber: data.frequentFlyerNumber || undefined,
      });
      
      setPassenger(passenger);
      toast.success("Passenger details saved successfully!");
      router.push("/payment");
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Failed to save passenger details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full rounded-2xl border bg-white/40 px-5 pr-12 py-[16px] text-[15px] text-slate-900 font-bold placeholder:text-slate-500/70 outline-none backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 group-hover/input:bg-white/60 group-hover/input:shadow-[inset_0_2px_20px_rgba(255,255,255,0.9),0_8px_25px_rgba(0,0,0,0.06)] shadow-[inset_0_2px_10px_rgba(255,255,255,0.6),0_4px_15px_rgba(0,0,0,0.03)] focus:bg-white/80 focus:shadow-[inset_0_2px_20px_rgba(255,255,255,0.9),0_8px_30px_rgba(144,213,240,0.4)] focus:-translate-y-0.5 group-hover/input:-translate-y-0.5 ${
      hasError ? "border-red-400 focus:border-red-500" : "border-white/60 focus:border-[#90D5F0] group-hover/input:border-white/90"
    }`;

  const iconClasses = "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400/80 pointer-events-none group-focus-within/input:text-[#70CBF6] transition-colors duration-300 drop-shadow-sm";

  // Data Formatting for Summary
  

  const originCode = originAirport?.code || "---";
  const destinationCode = destinationAirport?.code || "---";
  const originCity = originAirport?.city || "---";
  const destinationCity = destinationAirport?.city || "---";

  let depDateStr = "---";
  let durationStr = "---";
  if (flight) {
    const depDate = new Date(flight.departureTime);
    const arrDate = new Date(flight.arrivalTime);
    depDateStr = format(depDate, "dd MMM yyyy");

    const durationMinutes = Math.floor((arrDate.getTime() - depDate.getTime()) / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    durationStr = `${hours}h ${mins}m`;
  }

  const selectedSeatPrice = selectedSeat?.price || 0;
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(selectedSeatPrice);


  if (isFlightLoading || isSeatsLoading || isAirportsLoading || !reservation) {
    return (
      <main className="relative min-h-screen bg-slate-100 flex items-center justify-center overflow-hidden">
        {/* Background blobs for continuity */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-blue-50/10 to-indigo-50/10 pointer-events-none select-none z-0 overflow-hidden">
          <div className="absolute top-[15%] left-[25%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-300 to-indigo-400 opacity-25 blur-[100px]" />
          <div className="absolute top-[40%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-300 to-pink-300 opacity-[0.16] blur-[120px]" />
        </div>
        <div className="relative z-10 w-24 h-24">
          <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/20 animate-pulse" />
          <div className="w-full h-full rounded-full border border-white/40 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-[-50%] animate-[spin_1.5s_linear_infinite]"
              style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(59, 130, 246, 0.9) 100%)' }}
            />
            <div className="absolute inset-[4px] rounded-full bg-slate-50 border border-white/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen bg-slate-100 overflow-hidden">
      {/* Subtle background gradient and highly transparent blobs for liquid glassy feel */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-blue-50/20 to-indigo-50/20 pointer-events-none select-none z-0 overflow-hidden">
        <div className="absolute top-[15%] left-[25%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-300 to-indigo-400 opacity-[0.12] blur-[100px]" />
        <div className="absolute top-[40%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-300 to-pink-300 opacity-[0.08] blur-[120px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-sky-200 to-emerald-200 opacity-[0.08] blur-[90px]" />
      </div>
      <Spotlight className="opacity-40" fill="rgba(144, 213, 240, 0.2)" />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Edge-Attached Floating Back Button (Desktop) */}
      <button
        onClick={handleBack}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] group hidden md:flex items-center justify-center w-12 h-32 xl:w-16 xl:h-40 rounded-r-[2.5rem] bg-white/40 hover:bg-white/70 backdrop-blur-3xl backdrop-saturate-200 border-y border-r border-white/80 shadow-[8px_0_32px_rgba(0,0,0,0.06),inset_2px_0_8px_rgba(255,255,255,1)] hover:shadow-[16px_0_48px_rgba(0,0,0,0.1),inset_4px_0_12px_rgba(255,255,255,1)] transition-all duration-500 ease-out hover:w-16 hover:xl:w-20 active:scale-[0.98] pr-2 xl:pr-3"
      >
        <ArrowLeft className="h-6 w-6 xl:h-8 xl:w-8 text-slate-600 group-hover:text-slate-900 transition-transform duration-300 group-hover:-translate-x-1" />
      </button>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-6 animate-fade-in flex flex-col gap-8">
        
        {/* Top Header: Breadcrumbs & Mobile Back Button */}
        <div className="relative flex flex-col gap-6 w-full">
          <Breadcrumb currentStep="passenger" />
          <div className="w-full flex md:hidden justify-start">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white/50 backdrop-blur-md border border-white/60 rounded-[1.25rem] hover:bg-white/80 hover:text-slate-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)] select-none cursor-pointer w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6 mt-4 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-3">
            Passenger Details
            <span className="text-sm font-bold text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full border border-blue-200/50 backdrop-blur-sm align-middle">
              Seat {selectedSeat?.seatNumber || "--"}
            </span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 max-w-md">Please enter the details exactly as they appear on your government-issued identification.</p>
        </div>

        {/* Main Selection Area */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-10 items-start">

          {/* Left Side: Form Pane */}

          <div className="flex-1 w-full flex flex-col items-center lg:border-r border-slate-200/50 px-4">

            {/* Glass Form Container - Receipt Style */}
            <div className="relative w-full max-w-2xl bg-gradient-to-b from-white/60 to-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.4),inset_0_1px_20px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_48px_rgba(144,213,240,0.25),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_20px_rgba(255,255,255,1)] backdrop-blur-[40px] backdrop-saturate-150 p-8 sm:p-12 border-t border-x border-b-2 border-white/70 border-b-white/50 border-dashed rounded-t-[3rem] rounded-b-2xl transition-all duration-500">
              
              <div className="absolute inset-0 shadow-[0_0_40px_rgba(255,255,255,0.4)] rounded-[2.5rem] pointer-events-none" />

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const currentIdx = stepsList.findIndex(s => s.id === currentStep);
                  if (currentIdx === stepsList.length - 1) {
                    handleSubmit(onSubmit)(e);
                  } else {
                    handleNext();
                  }
                }} 
                className="z-10 relative space-y-10"
              >
                


                {/* Step Indicators */}
                <div className="flex flex-col items-center gap-3 mb-10">
                  <div className="flex items-center justify-center gap-2">
                    {stepsList.map((step, idx) => (
                      <div
                        key={step.id}
                        className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                          currentStep === step.id
                            ? "w-12 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                            : stepsList.findIndex(s => s.id === currentStep) > idx
                            ? "w-4 bg-blue-400/60 shadow-inner"
                            : "w-4 bg-slate-300/50 shadow-inner border border-white/40"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600/80 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100">
                    Step {stepsList.findIndex(s => s.id === currentStep) + 1} of {stepsList.length} &bull; {stepsList.find(s => s.id === currentStep)?.title}
                  </span>
                </div>

                {/* Section 1: Personal Information */}
                {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5 min-h-[320px]">
                  
                  <div className="flex items-center justify-between border-b border-dashed border-slate-300/80 pb-4 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#90D5F0]" /> Personal Information
                    </h3>
                    
                    <Popover>
                      <PopoverTrigger type="button" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_4px_rgba(255,255,255,0.9)]" title="Quick Fill from Saved Passengers">
                        <Users className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-4 bg-white/40 backdrop-blur-3xl backdrop-saturate-200 border border-white/70 shadow-[0_12px_40px_rgba(30,58,138,0.15),inset_0_1px_20px_rgba(255,255,255,0.9)] rounded-2xl" align="end" sideOffset={8}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-700">Quick Fill</span>
                        </div>
                        <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {savedPassengers.length > 0 ? (
                            savedPassengers.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleQuickFill(p)}
                                className="flex items-center gap-3 bg-white/60 hover:bg-white/95 hover:text-blue-700 text-slate-700 px-3 py-2.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-white/80 hover:border-blue-300 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-300 text-sm font-bold group/btn w-full text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-white/70 group-hover/btn:bg-blue-50 flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,1)] border border-white/50 transition-all">
                                  <User className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-blue-500 transition-colors" />
                                </div>
                                <span className="truncate">{p.firstName} {p.lastName}</span>
                              </button>
                            ))
                          ) : (
                            <div className="bg-white/40 border border-white/60 p-4 rounded-xl text-center shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.8)]">
                              <span className="text-sm text-slate-500 font-medium leading-relaxed">
                                No saved passengers found. You can add them in your profile.
                              </span>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-4">Please enter your name exactly as it appears on your ID.</p>
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group/input relative">
                        <input autoFocus type="text" placeholder="First Name" {...register("firstName")} disabled={isSaving} className={inputClasses(!!errors.firstName)} />
                        <User className={iconClasses} strokeWidth={2} size={18} />
                        {errors.firstName && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.firstName.message}</p>}
                      </div>
                      <div className="group/input relative">
                        <input type="text" placeholder="Last Name" {...register("lastName")} disabled={isSaving} className={inputClasses(!!errors.lastName)} />
                        <User className={iconClasses} strokeWidth={2} size={18} />
                        {errors.lastName && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.lastName.message}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group/input relative">
                        <select {...register("gender")} disabled={isSaving} className={`${inputClasses(!!errors.gender)} appearance-none`}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.gender && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.gender.message}</p>}
                      </div>
                      <div className="group/input relative">
                        <DOBDatePicker
                          open={dobPickerOpen}
                          onOpenChange={setDobPickerOpen}
                          selected={dobValue}
                          onSelect={(date) => setValue("dateOfBirth", date as Date, { shouldValidate: true })}
                        >
                          <button
                            type="button"
                            onClick={() => setDobPickerOpen(true)}
                            disabled={isSaving}
                            className={`${inputClasses(!!errors.dateOfBirth)} text-left flex items-center`}
                          >
                            <span className={dobValue ? "text-slate-900" : "text-slate-500/70 font-normal"}>
                              {dobValue ? format(dobValue, "dd MMM yyyy") : "Date of Birth"}
                            </span>
                          </button>
                        </DOBDatePicker>
                        <Calendar className={iconClasses} strokeWidth={2} size={18} />
                        {errors.dateOfBirth && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.dateOfBirth.message as string}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
                )}

                {/* Section 2: Contact Information */}
                {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-5 min-h-[320px]">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-dashed border-slate-300/80 pb-4 mb-2">
                    <Mail className="w-5 h-5 text-[#90D5F0]" /> Contact & Nationality
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-4">We'll use this to send your booking confirmation and updates.</p>
                  <div className="flex flex-col gap-5">
                    <div className="group/input relative">
                      <input autoFocus
                        type="text" 
                        placeholder="Nationality" 
                        {...register("nationality")} 
                        disabled={isSaving} 
                        className={inputClasses(!!errors.nationality)}
                        onFocus={() => setShowNationalityDropdown(true)}
                        onBlur={() => setTimeout(() => setShowNationalityDropdown(false), 200)}
                      />
                      <Globe className={iconClasses} strokeWidth={2} size={18} />
                      {showNationalityDropdown && filteredNationalities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/30 backdrop-blur-3xl backdrop-saturate-150 border border-white/50 shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_20px_rgba(255,255,255,0.8)] rounded-2xl overflow-hidden p-1.5 max-h-60 overflow-y-auto">
                          {filteredNationalities.map(country => (
                            <div 
                              key={country} 
                              className="px-4 py-2.5 mb-0.5 last:mb-0 hover:bg-white/40 cursor-pointer rounded-xl text-slate-800 font-bold transition-all border border-transparent hover:border-white/50 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
                              onClick={() => {
                                setValue("nationality", country, { shouldValidate: true });
                                setShowNationalityDropdown(false);
                              }}
                            >
                              {country}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.nationality && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.nationality.message}</p>}
                    </div>
                    <div className="group/input relative">
                      <input type="email" placeholder="Email" {...register("email")} disabled={isSaving} className={inputClasses(!!errors.email)} />
                      <Mail className={iconClasses} strokeWidth={2} size={18} />
                      {errors.email && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.email.message}</p>}
                    </div>
                    <div className="group/input relative">
                      <input type="tel" placeholder="Phone" {...register("phone")} disabled={isSaving} className={inputClasses(!!errors.phone)} />
                      <Phone className={iconClasses} strokeWidth={2} size={18} />
                      {errors.phone && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>
                  </div>
                </motion.div>
                )}

                {/* Section 3: Passport (Optional) */}
                {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-5 min-h-[320px]">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-dashed border-slate-300/80 pb-4 mb-2">
                    <CreditCard className="w-5 h-5 text-[#90D5F0]" /> Passport Details {isInternational ? <span className="text-red-400 font-semibold text-sm ml-2">(Required for International Flights)</span> : <span className="text-slate-400 font-normal text-sm ml-2">(Optional)</span>}
                  </h3>
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="group/input relative">
                        <input autoFocus type="text" placeholder="Passport No." {...register("passportNumber")} disabled={isSaving} className={inputClasses(!!errors.passportNumber)} />
                        <CreditCard className={iconClasses} strokeWidth={2} size={18} />
                        {errors.passportNumber && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.passportNumber.message}</p>}
                      </div>
                      <div className="group/input relative flex flex-col justify-center">
                        <DOBDatePicker
                          open={expiryPickerOpen}
                          onOpenChange={setExpiryPickerOpen}
                          selected={expiryValue}
                          onSelect={(date) => setValue("passportExpiry", date as Date, { shouldValidate: true })}
                          isExpiry={true}
                        >
                          <button
                            type="button"
                            onClick={() => setExpiryPickerOpen(true)}
                            disabled={isSaving}
                            className={`${inputClasses(!!errors.passportExpiry)} text-left flex items-center`}
                          >
                            <span className={expiryValue ? "text-slate-900" : "text-slate-500/70 font-normal"}>
                              {expiryValue ? format(expiryValue, "dd MMM yyyy") : "Expiry Date"}
                            </span>
                          </button>
                        </DOBDatePicker>
                        <Calendar className={iconClasses} strokeWidth={2} size={18} />
                        {errors.passportExpiry && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.passportExpiry.message as string}</p>}
                      </div>
                    </div>
                    <div className="group/input relative">
                      <input 
                        type="text" 
                        placeholder="Passport Country" 
                        {...register("passportCountry")} 
                        disabled={isSaving} 
                        className={inputClasses(!!errors.passportCountry)}
                        onFocus={() => setShowPassportCountryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowPassportCountryDropdown(false), 200)}
                      />
                      <Flag className={iconClasses} strokeWidth={2} size={18} />
                      {showPassportCountryDropdown && filteredPassportCountries.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/30 backdrop-blur-3xl backdrop-saturate-150 border border-white/50 shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_20px_rgba(255,255,255,0.8)] rounded-2xl overflow-hidden p-1.5 max-h-60 overflow-y-auto">
                          {filteredPassportCountries.map(country => (
                            <div 
                              key={country} 
                              className="px-4 py-2.5 mb-0.5 last:mb-0 hover:bg-white/40 cursor-pointer rounded-xl text-slate-800 font-bold transition-all border border-transparent hover:border-white/50 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
                              onClick={() => {
                                setValue("passportCountry", country, { shouldValidate: true });
                                setShowPassportCountryDropdown(false);
                              }}
                            >
                              {country}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.passportCountry && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.passportCountry.message}</p>}
                    </div>
                  </div>
                </motion.div>
                )}

                {/* Section 4: Preferences (Optional) */}
                {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-5 min-h-[320px]">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-dashed border-slate-300/80 pb-4 mb-2">
                    <FileText className="w-5 h-5 text-[#90D5F0]" /> Preferences <span className="text-slate-400 font-normal text-sm ml-2">(Optional)</span>
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[11px] text-slate-500 ml-2 font-black uppercase tracking-wider">Meal Preference</label>
                      <div className="flex flex-wrap gap-3">
                        {["Standard", "Vegetarian", "Vegan", "Gluten-Free"].map((meal) => (
                          <button
                            key={meal}
                            type="button"
                            onClick={() => setValue("mealPreference", meal)}
                            disabled={isSaving}
                            className={`px-5 py-2.5 rounded-2xl border text-sm font-bold backdrop-blur-xl transition-all duration-300 shadow-sm ${
                              mealValue === meal 
                                ? "bg-blue-500/10 border-blue-400 text-blue-600 shadow-[inset_0_2px_8px_rgba(59,130,246,0.1)]" 
                                : "bg-white/40 border-white/60 text-slate-600 hover:bg-white/60"
                            }`}
                          >
                            {meal}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <label className="text-[11px] text-slate-500 ml-2 font-black uppercase tracking-wider">Special Assistance</label>
                      <div className="flex items-center gap-4 ml-2">
                        <button
                          type="button"
                          onClick={() => setValue("specialAssistance", specialAssistanceValue === "yes" ? "no" : "yes")}
                          disabled={isSaving}
                          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                            specialAssistanceValue === "yes" ? "bg-blue-400" : "bg-slate-300/50"
                          } border border-white/50 shadow-inner`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              specialAssistanceValue === "yes" ? "translate-x-9" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className="text-sm font-bold text-slate-700">
                          {specialAssistanceValue === "yes" ? "Yes, I need assistance" : "No"}
                        </span>
                      </div>
                    </div>

                    <div className="group/input relative mt-2">
                      <input type="text" placeholder="Frequent Flyer No." {...register("frequentFlyerNumber")} disabled={isSaving} className={inputClasses(!!errors.frequentFlyerNumber)} />
                    </div>
                  </div>
                </motion.div>
                )}


                {/* Navigation Buttons */}
                <div className="pt-8 flex items-center relative border-t-2 border-dashed border-slate-300/60 mt-8">
                  <div className="absolute left-0">
                    {stepsList.findIndex(s => s.id === currentStep) > 0 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="px-5 py-3 rounded-full text-slate-500 font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" /> Previous
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex justify-center">
                    {stepsList.findIndex(s => s.id === currentStep) < stepsList.length - 1 ? (
                      <button
                        key="btn-next-step"
                        type="button"
                        onClick={handleNext}
                        className="px-12 py-3.5 w-full max-w-[280px] rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                      >
                        Next Step <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        key="btn-submit"
                        type="submit"
                        disabled={isSaving}
                        className="group/btn relative w-full max-w-[280px] bg-[#90D5F0]/90 backdrop-blur-md border border-white/80 disabled:opacity-70 shadow-[0_8px_32px_rgba(144,213,240,0.4),inset_0_0_0_1px_rgba(255,255,255,0.6),inset_0_1px_20px_rgba(255,255,255,1)] hover:bg-[#90D5F0] hover:shadow-[0_16px_48px_rgba(144,213,240,0.5),inset_0_0_0_1px_rgba(255,255,255,0.8),inset_0_1px_20px_rgba(255,255,255,1)] py-[14px] px-8 rounded-full overflow-hidden font-bold text-[15px] text-slate-900 active:scale-[0.98] transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative z-10">
                          {isSaving ? (
                            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving...</span>
                          ) : (
                            <span className="flex items-center gap-2">Save & Continue <ChevronRight className="w-5 h-5" /></span>
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

              </form>
            </div>
          </div>


          {/* Right Side: Booking Summary & Pricing Pane */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-hide pb-4">

            {reservation?.expiresAt && <CountdownTimer expiresAt={reservation.expiresAt} />}

            {/* Flight Details Mini-Card */}

            <div className="relative p-5 rounded-[2.5rem] bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04),inset_0_2px_10px_rgba(255,255,255,1)] flex flex-col gap-4 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

              <div className="flex justify-between items-center z-10 relative">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{depDateStr}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 shadow-sm">{flight?.flightNumber || "---"}</span>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2 z-10 relative">
                <div className="flex flex-col min-w-[3rem]">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{originCode}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{originCity}</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative px-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 absolute -top-4">
                    {durationStr}
                  </span>

                  <div className="w-full flex items-center relative mt-1">
                    <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-blue-400 bg-white z-10 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                    <div className="flex-1 border-t-[1.5px] border-dashed border-slate-300 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full z-10 backdrop-blur-md border border-slate-200 shadow-sm">
                        <Plane className="h-3.5 w-3.5 text-blue-600 rotate-45 drop-shadow-sm" />
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-blue-400 bg-white z-10 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                  </div>

                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mt-2 absolute -bottom-5">
                    Non-stop
                  </span>
                </div>

                <div className="flex flex-col text-right min-w-[3rem]">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{destinationCode}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{destinationCity}</span>
                </div>
              </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="relative p-5 rounded-[2.5rem] bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04),inset_0_2px_10px_rgba(255,255,255,1)] flex flex-col gap-4 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

              <div className="flex flex-col gap-1 z-10 relative border-b border-slate-200/50 pb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reserved Seat</span>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter drop-shadow-sm">
                    {selectedSeat ? selectedSeat.seatNumber : "--"}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 px-3 py-1 bg-blue-100/50 rounded-full border border-blue-200/50 backdrop-blur-sm shadow-inner">
                    {selectedSeat ? selectedSeat.class.replace("_", " ") : "None"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center z-10 relative">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seat Price</span>
                <span className="text-lg font-bold text-slate-800">{formattedPrice}</span>
              </div>
              
              <div className="flex justify-between items-center z-10 relative">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Taxes & Fees</span>
                <span className="text-lg font-bold text-slate-800">₹0</span>
              </div>

              
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent my-1 z-10 relative" />

              <div className="flex justify-between items-center z-10 relative pb-2 border-b border-slate-200/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Passenger</span>
                <span className="text-sm font-bold text-slate-800 text-right">
                  {(watch("firstName") || watch("lastName")) ? `${watch("firstName")} ${watch("lastName")}` : "Not entered yet"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-1 z-10 relative">

                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Due</span>
                <span className="text-2xl font-black text-blue-600 tracking-tight drop-shadow-sm">{formattedPrice}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
