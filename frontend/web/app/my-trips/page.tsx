"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInMinutes } from "date-fns";
import { Plane, Calendar, ChevronRight, CheckCircle2, XCircle, Clock, AlertCircle, ArrowDownUp, ShieldAlert, CreditCard, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/store/auth";
import { getUserReservations, cancelReservation } from "@/services/reservation";
import { getFlightById } from "@/services/flight";
import { requestRefund, getPaymentSummary, PaymentSummaryResponse } from "@/services/payment";
import { ReservationResponse } from "@/types/reservation";
import { FlightResponse } from "@/types/flight";
import { useAirports } from "@/hooks/useAirport";
import Navbar from "@/components/layout/Navbar";
import { Spotlight } from "@/components/ui/spotlight";

interface TripData extends ReservationResponse {
  flightDetails?: FlightResponse;
  paymentSummary?: PaymentSummaryResponse;
}

const sortOptions = [
  { value: "latest", label: "Latest Trips (Newest First)" },
  { value: "oldest", label: "Oldest Trips First" },
  { value: "price_high", label: "Price (High to Low)" },
  { value: "price_low", label: "Price (Low to High)" },
];

export default function MyTripsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { airports, isLoading: airportsLoading } = useAirports();

  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"successful" | "failed">("successful");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [cancelModalData, setCancelModalData] = useState<{ id: string, status: string } | null>(null);
  const [isCancelling, setIsCancelling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user) return;

    async function fetchTrips() {
      try {
        setLoading(true);
        const reservations = await getUserReservations(user!.id);

        const tripsWithDetails = await Promise.all(
          reservations.map(async (res) => {
            let flightDetails: FlightResponse | undefined;
            let paymentSummary: PaymentSummaryResponse | undefined;

            try {
              flightDetails = await getFlightById(res.flightId);
            } catch (err) {
              console.error(`Failed to fetch flight ${res.flightId}`, err);
            }

            try {
              paymentSummary = await getPaymentSummary(res.id);
            } catch (err) {
              // Ignore missing payment for pending/failed bookings
            }

            return { ...res, flightDetails, paymentSummary };
          })
        );

        setTrips(tripsWithDetails);
      } catch (err: any) {
        setError(err.message || "Failed to load trips.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [user, authLoading, router]);

  const handleCancel = async (reservationId: string, status: string) => {
    if (!user) return;

    setIsCancelling(prev => ({ ...prev, [reservationId]: true }));
    const toastId = toast.loading("Canceling booking...");

    try {
      if (status.toLowerCase() === "confirmed") {
        await requestRefund({
          reservationId: reservationId,
          reason: "customer_cancellation"
        });
        toast.success("Cancellation requested. Your refund is being processed.", { id: toastId });
      } else {
        await cancelReservation(reservationId, user.id);
        toast.success("Booking cancelled successfully", { id: toastId });
      }

      setTrips(trips.map(trip =>
        trip.id === reservationId ? {
          ...trip,
          status: "cancelled",
          paymentSummary: trip.paymentSummary ? { ...trip.paymentSummary, refundStatus: 'pending' } : undefined
        } : trip
      ));
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data || "Failed to cancel booking. Please try again later.", { id: toastId });
    } finally {
      setIsCancelling(prev => ({ ...prev, [reservationId]: false }));
    }
  };

  const getAirportCode = (id?: string) => {
    if (!id) return "---";
    const ap = airports.find((a) => a.id === id);
    return ap ? ap.code : id;
  };

  const getAirportCity = (id?: string) => {
    if (!id) return "Unknown";
    const ap = airports.find((a) => a.id === id);
    return ap ? ap.city : "Unknown";
  };

  const formatDuration = (start?: Date | string, end?: Date | string) => {
    if (!start || !end) return "--h --m";
    const mins = differenceInMinutes(new Date(end), new Date(start));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getStatusConfig = (trip: TripData) => {
    const s = trip.status.toLowerCase();

    if (s === "cancelled") {
      const refundStatus = trip.paymentSummary?.refundStatus?.toLowerCase();
      if (refundStatus === "pending") {
        return {
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          color: "text-orange-700",
          bg: "bg-orange-400/20 border-orange-200/50",
          label: "Refund Pending",
        };
      }
      if (refundStatus === "succeeded") {
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          color: "text-emerald-700",
          bg: "bg-emerald-400/20 border-emerald-200/50",
          label: "Refund Processed",
        };
      }
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        color: "text-red-700",
        bg: "bg-red-400/20 border-red-200/50",
        label: "Cancelled",
      };
    }

    if (s === "confirmed") {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        color: "text-emerald-700",
        bg: "bg-emerald-400/20 border-emerald-200/50",
        label: "Confirmed",
      };
    }

    if (s === "failed") {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        color: "text-red-700",
        bg: "bg-red-400/20 border-red-200/50",
        label: "Failed",
      };
    }

    return {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: "text-amber-700",
      bg: "bg-amber-400/20 border-amber-200/50",
      label: "Pending",
    };
  };

  const filteredTrips = trips.filter(trip => {
    const s = trip.status.toLowerCase();
    const isSuccess = s === "confirmed" || s === "pending";
    if (activeTab === "successful") return isSuccess;
    return !isSuccess;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    const pA = a.paymentSummary?.amount || 0;
    const pB = b.paymentSummary?.amount || 0;

    switch (sortOrder) {
      case "oldest": return tA - tB;
      case "price_high": return pB - pA;
      case "price_low": return pA - pB;
      case "latest":
      default: return tB - tA;
    }
  });

  if (authLoading || (loading && trips.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-[120px]" />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 relative z-10"></div>
        <p className="text-slate-500 mt-4 font-medium relative z-10">Loading your trips...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 relative overflow-hidden pb-32 pt-28">
        {/* Deep Liquid Glass Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="#3b82f6" />
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-300/30 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-300/30 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[60%] w-[40%] h-[40%] bg-purple-300/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="mb-12 pt-6">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">My Trips</h1>
            <p className="text-slate-500 mt-3 text-lg max-w-xl leading-relaxed">Manage your upcoming flights, review past reservations, and easily handle cancellations.</p>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-md border border-red-200/60 text-red-700 px-6 py-5 rounded-[1.5rem] flex items-center gap-4 mb-8 shadow-sm">
              <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Filters and Tabs */}
          {(!error && trips.length > 0) && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              {/* Glassmorphic Tabs */}
              <div className="flex bg-white/30 backdrop-blur-xl p-1.5 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-fit relative z-20">
                <button
                  onClick={() => setActiveTab("successful")}
                  className={`relative px-7 py-3 rounded-full text-sm font-bold transition-all duration-300 overflow-hidden ${
                    activeTab === "successful" ? "text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {activeTab === "successful" && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/90 backdrop-blur-md -z-10 rounded-full" />
                  )}
                  Active & Successful
                </button>
                <button
                  onClick={() => setActiveTab("failed")}
                  className={`relative px-7 py-3 rounded-full text-sm font-bold transition-all duration-300 overflow-hidden ${
                    activeTab === "failed" ? "text-red-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {activeTab === "failed" && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/90 backdrop-blur-md -z-10 rounded-full" />
                  )}
                  Failed & Cancelled
                </button>
              </div>

              {/* Custom Glassmorphic Sort Dropdown */}
              <div className="relative group z-30" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full md:w-72 flex items-center justify-between gap-3 bg-white/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-700">
                    <ArrowDownUp className="w-4 h-4" />
                    <span className="text-sm font-bold">{sortOptions.find(o => o.value === sortOrder)?.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isSortOpen ? "rotate-90" : ""}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-full md:w-72 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl overflow-hidden py-2"
                    >
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortOrder(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${
                            sortOrder === option.value ? "bg-blue-50/80 text-blue-700" : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {sortedTrips.length === 0 && !error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-16 text-center shadow-[0_8px_40px_rgb(0,0,0,0.04)] mt-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                  <Plane className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-3">No trips found</h3>
                <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                  {trips.length > 0
                    ? `You have no ${activeTab} reservations matching this criteria.`
                    : "Your itinerary is a blank canvas. Let's find your next adventure!"}
                </p>
                {trips.length === 0 && (
                  <button
                    onClick={() => router.push("/")}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    Search Flights
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
                  },
                  exit: { opacity: 0 }
                }}
                className="space-y-6"
              >
                {sortedTrips.map((trip) => {
                  const status = getStatusConfig(trip);
                  const isSuccess = trip.status.toLowerCase() === "confirmed";
                  const canCancel = isSuccess || trip.status.toLowerCase() === "pending";
                  const cancelling = isCancelling[trip.id] || false;

                  return (
                    <motion.div
                      layout
                      variants={{
                        hidden: { opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" },
                        show: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          filter: "blur(0px)",
                          transition: { type: "spring", bounce: 0.4, duration: 0.8 }
                        },
                        exit: {
                          opacity: 0,
                          scale: 0.9,
                          filter: "blur(10px)",
                          transition: { duration: 0.2 }
                        }
                      }}
                      exit="exit"
                      key={trip.id}
                      className="group relative transition-all duration-500 mt-6"
                    >
                      {/* Card Background & Clipping Container */}
                      <div className="absolute inset-0 rounded-[2.5rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group-hover:bg-white/40 overflow-hidden transition-all duration-500">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />
                      </div>

                      {/* Top Center Status Pill - Overlapping */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className={`inline-flex items-center gap-2 px-6 py-1.5 rounded-full border shadow-md backdrop-blur-md ${status.bg.replace('/20', '/80').replace('/10', '/80')} bg-white/90`}>
                          {status.icon}
                          <span className={`text-[11px] font-black uppercase tracking-wider ${status.color}`}>{status.label}</span>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 justify-between relative z-10 pt-10 md:pt-8">

                        {/* Left Section: Core Flight Data */}
                        <div className="flex-1 flex flex-col md:flex-row gap-8 md:items-center">
                          {/* Route & Times */}
                          <div className="flex-1 min-w-[280px]">
                            <div className="flex items-center justify-between mb-6">
                              <div className="text-center w-24">
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{getAirportCode(trip.flightDetails?.originAirportId)}</div>
                                <div className="text-base font-bold text-slate-600 mt-1">{getAirportCity(trip.flightDetails?.originAirportId)}</div>
                                {trip.flightDetails && <div className="text-sm font-semibold text-slate-500 mt-0.5">{format(new Date(trip.flightDetails.departureTime), "HH:mm")}</div>}
                              </div>

                              <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                                <div className="w-full border-t-2 border-dashed border-slate-300 relative mb-3">
                                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${isSuccess ? 'bg-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-400'}`}>
                                    <Plane className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </div>
                                <span className="text-[11px] font-black tracking-widest text-slate-500 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm">
                                  {trip.flightDetails?.flightNumber || "FLIGHT"}
                                </span>
                              </div>

                              <div className="text-center w-24">
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{getAirportCode(trip.flightDetails?.destinationAirportId)}</div>
                                <div className="text-base font-bold text-slate-600 mt-1">{getAirportCity(trip.flightDetails?.destinationAirportId)}</div>
                                {trip.flightDetails && <div className="text-sm font-semibold text-slate-500 mt-0.5">{format(new Date(trip.flightDetails.arrivalTime), "HH:mm")}</div>}
                              </div>
                            </div>

                            {/* Meta row - Glassmorphic pills */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {trip.flightDetails ? format(new Date(trip.flightDetails.departureTime), "MMM dd, yyyy") : 'Unknown Date'}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {formatDuration(trip.flightDetails?.departureTime, trip.flightDetails?.arrivalTime)}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm">
                                REF: {trip.reservationRef}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section: Actions */}
                        <div className="flex flex-col md:w-56 md:border-l border-white/60 md:pl-8 justify-center mt-6 md:mt-0">

                          {/* Actions */}
                          <div className="flex flex-col gap-3">
                            {canCancel ? (
                              <>
                                {isSuccess && (
                                  <button
                                    onClick={() => router.push(`/boarding-pass/${trip.id}`)}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md group/btn"
                                  >
                                    View Ticket
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setCancelModalData({ id: trip.id, status: trip.status })}
                                  disabled={cancelling}
                                  className="w-full flex items-center justify-center gap-2 bg-white/70 hover:bg-red-50/80 disabled:bg-slate-50 disabled:text-slate-400 text-red-600 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm border border-red-200/50 disabled:border-slate-200 disabled:cursor-not-allowed backdrop-blur-md"
                                >
                                  {cancelling ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                      Canceling...
                                    </>
                                  ) : (
                                    "Cancel Booking"
                                  )}
                                </button>
                              </>
                            ) : (
                              <div className="w-full text-center py-3 bg-slate-100/50 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-200/50 backdrop-blur-sm">
                                No Actions
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Expanded Dual-Pane Glassmorphic Custom Modal */}
      <AnimatePresence>
        {cancelModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2.5rem] w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row"
            >

              {/* Left Pane: Confirmation Action */}
              <div className="flex-1 p-8 md:p-12 text-center md:text-left relative z-10 flex flex-col justify-center bg-white/50">
                <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6 shadow-sm">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Confirm Cancellation</h3>
                <p className="text-slate-600 mb-10 text-base font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                  Are you absolutely sure you want to cancel this booking? This action is permanent and cannot be undone.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button
                    onClick={() => setCancelModalData(null)}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => {
                      const data = cancelModalData;
                      setCancelModalData(null);
                      handleCancel(data.id, data.status);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-[0_8px_20px_rgb(239,68,68,0.3)] hover:shadow-[0_12px_25px_rgb(239,68,68,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Yes, Cancel Now
                  </button>
                </div>
              </div>

              {/* Right Pane: Guidelines */}
              <div className="flex-1 p-8 md:p-12 relative z-10 bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-200/60">
                <div className="mb-8 border-b border-slate-200/60 pb-4">
                  <h4 className="text-xl font-bold text-slate-800">Refund Guidelines</h4>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1 text-sm uppercase tracking-wider">24-Hour Policy</h5>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">Cancel within 24 hours of booking for a full refund to your original payment method.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 mb-1 text-sm uppercase tracking-wider">Processing Time</h5>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">Refunds typically take 5-7 business days to reflect on your bank statement after processing.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 mb-1 text-sm uppercase tracking-wider">Non-Refundable Fees</h5>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">Certain convenience fees and seat selection charges may be non-refundable per airline policy.</p>
                  </div>
                </div>

                <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 text-center leading-relaxed">
                    By proceeding with this cancellation, you agree to the refund terms outlined above.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
