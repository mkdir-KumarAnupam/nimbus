"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Plane, CreditCard, ShieldCheck, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { useBookingStore } from "@/store/booking";
import { useFlight } from "@/hooks/useFlight";
import { useAirports } from "@/hooks/useAirport";
import { createPayment } from "@/services/payment";
import { getTicketByReservationId } from "@/services/ticket";
import { Spotlight } from "@/components/ui/spotlight";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
  const router = useRouter();
  const reservation = useBookingStore((state) => state.reservation);
  const { data: flight, isLoading: isFlightLoading } = useFlight(reservation?.flightId || "");
  const { airports, isLoading: isAirportsLoading } = useAirports();

  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isPaymentDataLoading, setIsPaymentDataLoading] = useState(true);
  const fetchedReservationId = useRef<string | null>(null);

  useEffect(() => {
    if (!reservation) {
      toast.error("No active reservation found. Please start a new booking.");
      router.push("/");
      return;
    }

    if (fetchedReservationId.current === reservation.id) {
      return;
    }

    async function fetchPaymentData() {
      try {
        fetchedReservationId.current = reservation!.id;
        const data = await createPayment({ reservation_id: reservation!.id });
        setPaymentData(data);
      } catch (err) {
        console.error("Payment initialization error:", err);
        // Only show toast if we don't already have paymentData
        setPaymentData((prev: any) => {
          if (!prev) toast.error("Failed to initialize payment data. Please go back and try again.");
          return prev;
        });
      } finally {
        setIsPaymentDataLoading(false);
      }
    }

    fetchPaymentData();
  }, [reservation, router]);

  if (!reservation) return null;

  const originAirport = airports.find((a) => a.id === flight?.originAirportId);
  const destinationAirport = airports.find((a) => a.id === flight?.destinationAirportId);

  // Use amount from backend if available, otherwise fallback to reservation total price
  const amountInPaise = paymentData?.amount || paymentData?.Amount || (reservation.totalPrice || 0) * 100;
  const displayAmount = amountInPaise / 100;

  const handlePayment = async () => {
    if (!razorpayLoaded || !paymentData) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }

    setIsProcessing(true);
    try {
      const options = {
        key: paymentData.key || paymentData.KeyID,
        amount: paymentData.amount || paymentData.Amount,
        currency: paymentData.currency || paymentData.Currency,
        name: "Nimbus",
        description: `Flight Booking - ${originAirport?.code} to ${destinationAirport?.code}`,
        order_id: paymentData.orderId || paymentData.OrderID,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment and issuing ticket...", { id: "payment-verify" });

            let ticket = null;
            let attempts = 0;
            while (!ticket && attempts < 10) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              try {
                ticket = await getTicketByReservationId(reservation.id);
              } catch (e) { }
              attempts++;
            }

            toast.dismiss("payment-verify");

            if (ticket) {
              toast.success("Payment successful! Ticket generated.");
              router.push(`/boarding-pass/${reservation.id}`);
            } else {
              toast.error("Payment was not received. Ticket generation failed.");
              router.push('/');
            }
          } catch (err) {
            toast.dismiss("payment-verify");
            toast.error("Error verifying ticket. Please contact support.");
          }
        },
        prefill: {
          name: "AirlineGO Flyer",
          email: "flyer@airlinego.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0f172a"
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info("Payment cancelled.");
          }
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.message || "Failed to initialize payment. Please try again.");
    }
  };

  return (
    <main className={cn('relative', 'bg-slate-50', 'w-screen', 'min-h-screen', 'overflow-y-auto')}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment gateway")}
      />

      {/* Identical Ambient Background from Boarding Pass */}
      <div className={cn('z-0', 'absolute', 'inset-0', 'overflow-hidden', 'pointer-events-none')}>
        <div className={cn('absolute', 'inset-0', 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]', 'from-blue-50', 'via-slate-50', 'to-indigo-50/50')} />

        {/* Glassy Confetti on Borders */}
        {[...Array(30)].map((_, i) => {
          const isLeft = i % 2 === 0;
          const xPos = isLeft ? Math.random() * 15 : 85 + Math.random() * 15;
          const yPos = Math.random() * 100;

          return (
            <motion.div
              key={`confetti-${i}`}
              animate={{
                y: [0, Math.random() * -100 - 50, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
              className={cn('absolute', 'opacity-40', 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]', 'backdrop-blur-3xl', 'border', 'border-white/40', 'mix-blend-multiply')}
              style={{
                width: `${Math.random() * 30 + 15}px`,
                height: `${Math.random() * 30 + 15}px`,
                borderRadius: i % 3 === 0 ? '50%' : '8px',
                background: i % 2 === 0
                  ? 'linear-gradient(135deg, rgba(147, 197, 253, 0.4), rgba(255, 255, 255, 0.1))'
                  : 'linear-gradient(135deg, rgba(196, 181, 253, 0.4), rgba(255, 255, 255, 0.1))',
                left: `${xPos}%`,
                top: `${yPos}%`,
              }}
            />
          );
        })}

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={cn('top-[10%]', '-right-[10%]', 'absolute', 'bg-blue-300/20', 'blur-[120px]', 'rounded-full', 'w-[600px]', 'h-[600px]', 'mix-blend-multiply')}
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className={cn('-bottom-[10%]', '-left-[10%]', 'absolute', 'bg-indigo-300/20', 'blur-[120px]', 'rounded-full', 'w-[700px]', 'h-[700px]', 'mix-blend-multiply')}
        />
      </div>

      {/* Edge-Attached Floating Back Button (Desktop) */}
      <button
        onClick={() => router.back()}
        className={cn('fixed', 'left-0', 'top-1/2', '-translate-y-1/2', 'z-[100]', 'group', 'hidden', 'md:flex', 'items-center', 'justify-center', 'w-12', 'h-32', 'xl:w-16', 'xl:h-40', 'rounded-r-[2.5rem]', 'bg-white/40', 'hover:bg-white/70', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'border-y', 'border-r', 'border-white/80', 'shadow-[8px_0_32px_rgba(0,0,0,0.06),inset_2px_0_8px_rgba(255,255,255,1)]', 'hover:shadow-[16px_0_48px_rgba(0,0,0,0.1),inset_4px_0_12px_rgba(255,255,255,1)]', 'transition-all', 'duration-500', 'ease-out', 'hover:w-16', 'hover:xl:w-20', 'active:scale-[0.98]', 'pr-2', 'xl:pr-3')}
      >
        <ArrowLeft className={cn('h-6', 'w-6', 'xl:h-8', 'xl:w-8', 'text-slate-600', 'group-hover:text-slate-900', 'transition-transform', 'duration-300', 'group-hover:-translate-x-1')} />
      </button>

      <div className={cn('z-10', 'relative', 'mx-auto', 'px-6', 'py-8', 'max-w-6xl')}>

        {/* Top Header: Breadcrumbs & Mobile Back Button */}
        <div className={cn('relative', 'flex', 'flex-col', 'gap-6', 'w-full', 'mb-16')}>
          <Breadcrumb currentStep="payment" />
          <div className={cn('w-full', 'flex', 'md:hidden', 'justify-start')}>
            <button
              onClick={() => router.back()}
              className={cn('group', 'flex', 'items-center', 'gap-2', 'px-5', 'py-2.5', 'text-[10px]', 'font-black', 'uppercase', 'tracking-wider', 'text-slate-600', 'bg-white/50', 'backdrop-blur-md', 'border', 'border-white/60', 'rounded-[1.25rem]', 'hover:bg-white/80', 'hover:text-slate-800', 'transition-all', 'shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)]', 'select-none', 'cursor-pointer', 'w-fit')}
            >
              <ArrowLeft className={cn('h-3.5', 'w-3.5', 'transition-transform', 'group-hover:-translate-x-0.5')} />
              <span>Back</span>
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mb-16', 'text-center')}
        >
          <h1 className={cn('font-black', 'text-slate-900', 'text-3xl', 'lg:text-5xl', 'tracking-tight')}>Complete your booking</h1>
          <p className={cn('mt-2', 'font-medium', 'text-slate-500', 'text-lg')}>Review your trip details and complete payment to secure your seat.</p>
        </motion.div>

        <div className={cn('items-stretch', 'gap-8', 'grid', 'grid-cols-1', 'lg:grid-cols-12')}>

          {/* Left Column: Trip Summary & Security Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={cn('flex', 'flex-col', 'gap-6', 'lg:col-span-7')}
          >
            {/* Main Flight Summary Glass Card */}
            <div className={cn('group', 'relative', 'bg-white/70', 'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]', 'backdrop-blur-2xl', 'p-8', 'lg:p-10', 'border', 'border-white', 'rounded-[2.5rem]', 'overflow-hidden')}>
              <div className={cn('z-10', 'absolute', 'inset-0', 'bg-gradient-to-tr', 'from-white/20', 'via-white/60', 'to-transparent', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-700', 'pointer-events-none', 'mix-blend-overlay')} />
              <div className={cn('top-0', 'right-0', 'absolute', 'opacity-[0.03]', 'p-8', 'pointer-events-none')}>
                <Plane className={cn('w-64', 'h-64', 'text-blue-900', '-rotate-12')} />
              </div>

              <h2 className={cn('z-20', 'relative', 'flex', 'items-center', 'gap-2', 'mb-8', 'font-bold', 'text-slate-900', 'text-xl')}>
                <div className={cn('flex', 'justify-center', 'items-center', 'bg-blue-50', 'shadow-sm', 'border', 'border-blue-100', 'rounded-full', 'w-8', 'h-8')}>
                  <Plane className={cn('w-4', 'h-4', 'text-blue-500')} />
                </div>
                Flight Summary
              </h2>

              {isFlightLoading || isAirportsLoading ? (
                <div className={cn('flex', 'justify-center', 'py-10')}><Loader2 className={cn('w-8', 'h-8', 'text-blue-500', 'animate-spin')} /></div>
              ) : flight && originAirport && destinationAirport ? (
                <div className={cn('z-20', 'relative', 'space-y-10')}>
                  <div className={cn('flex', 'justify-between', 'items-center')}>
                    <div className={cn('w-1/3', 'text-left')}>
                      <div className={cn('font-semibold', 'text-slate-500', 'text-sm')}>{originAirport.city}</div>
                      <div className={cn('mt-1', 'font-black', 'text-slate-800', 'text-4xl')}>{originAirport.code}</div>
                      <div className={cn('inline-block', 'bg-white/80', 'shadow-sm', 'backdrop-blur-md', 'mt-2', 'px-3', 'py-1', 'border', 'border-slate-200', 'rounded-full', 'font-bold', 'text-slate-400', 'text-xs')}>
                        {format(new Date(flight.departureTime), "dd MMM, HH:mm")}
                      </div>
                    </div>

                    <div className={cn('relative', 'flex', 'flex-col', 'flex-1', 'justify-center', 'items-center', 'mx-4', 'min-w-[120px]', 'h-20')}>
                      <div className={cn('top-[40%]', 'right-0', 'left-0', 'absolute', 'border-slate-300', 'border-t-2', 'border-dashed', 'h-0')}></div>
                      <div className={cn('top-[40%]', 'left-1/2', 'z-10', 'absolute', 'flex', 'justify-center', 'items-center', 'bg-white', 'shadow-md', 'border', 'border-slate-100', 'rounded-full', 'w-10', 'h-10', '-translate-x-1/2', '-translate-y-1/2')}>
                        <Plane className={cn('w-5', 'h-5', 'text-blue-500')} style={{ transform: "rotate(30deg)" }} />
                      </div>
                      <span className={cn('top-[75%]', 'z-10', 'absolute', 'bg-slate-50', 'shadow-sm', 'px-3', 'py-1', 'border', 'border-slate-200', 'rounded-full', 'font-bold', 'text-[10px]', 'text-slate-500')}>
                        {flight.flightNumber}
                      </span>
                    </div>

                    <div className={cn('flex', 'flex-col', 'items-end', 'w-1/3', 'text-right')}>
                      <div className={cn('font-semibold', 'text-slate-500', 'text-sm')}>{destinationAirport.city}</div>
                      <div className={cn('mt-1', 'font-black', 'text-slate-800', 'text-4xl')}>{destinationAirport.code}</div>
                      <div className={cn('inline-block', 'bg-white/80', 'shadow-sm', 'backdrop-blur-md', 'mt-2', 'px-3', 'py-1', 'border', 'border-slate-200', 'rounded-full', 'font-bold', 'text-slate-400', 'text-xs')}>
                        {format(new Date(flight.arrivalTime), "dd MMM, HH:mm")}
                      </div>
                    </div>
                  </div>

                  <div className={cn('flex', 'justify-between', 'items-center', 'bg-slate-50/80', 'hover:bg-white', 'shadow-sm', 'p-5', 'border', 'border-slate-100', 'rounded-2xl', 'transition-colors')}>
                    <div className={cn('flex', 'flex-col')}>
                      <span className={cn('mb-1', 'font-bold', 'text-[10px]', 'text-blue-500', 'uppercase', 'tracking-wider')}>Class</span>
                      <span className={cn('font-bold', 'text-slate-800', 'capitalize')}>{reservation.status === "confirmed" ? "Confirmed" : "Hold"}</span>
                    </div>
                    <div className={cn('bg-slate-200', 'w-px', 'h-10')}></div>
                    <div className={cn('flex', 'flex-col', 'items-end')}>
                      <span className={cn('mb-1', 'font-bold', 'text-[10px]', 'text-blue-500', 'uppercase', 'tracking-wider')}>Date</span>
                      <span className={cn('font-bold', 'text-slate-800')}>{format(new Date(flight.departureTime), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Secure Payment Info Glass Card */}
            <div className={cn('flex', 'sm:flex-row', 'flex-col', 'items-center', 'gap-6', 'bg-white/70', 'shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)]', 'backdrop-blur-2xl', 'p-6', 'border', 'border-white', 'rounded-[2rem]')}>
              <div className={cn('flex', 'flex-shrink-0', 'justify-center', 'items-center', 'bg-emerald-50', 'shadow-sm', 'border', 'border-emerald-100', 'rounded-[1.25rem]', 'w-16', 'h-16')}>
                <ShieldCheck className={cn('w-8', 'h-8', 'text-emerald-500')} />
              </div>
              <div>
                <h3 className={cn('font-bold', 'text-slate-800', 'text-lg')}>Secure Payment</h3>
                <p className={cn('mt-1', 'font-medium', 'text-slate-500', 'text-sm')}>Your payment is secured with 256-bit encryption by Razorpay. We never store your card details.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Pricing Summary & Pay Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className={cn('group', 'relative', 'flex', 'flex-col', 'justify-between', 'bg-white/70', 'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]', 'backdrop-blur-2xl', 'p-8', 'lg:p-10', 'border', 'border-white', 'rounded-[2.5rem]', 'h-full', 'overflow-hidden', 'text-slate-900')}>
              <div className={cn('z-10', 'absolute', 'inset-0', 'bg-gradient-to-tr', 'from-white/20', 'via-white/60', 'to-transparent', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-700', 'pointer-events-none', 'mix-blend-overlay')} />

              {/* Proper Spotlight inside Pay pane */}
              <div className={cn('z-0', 'absolute', 'inset-0', 'rounded-[2.5rem]', 'overflow-hidden', 'pointer-events-none')}>
                <Spotlight className={cn('-top-10', '-left-10', 'opacity-50', 'scale-150', 'mix-blend-overlay')} fill="#2563eb" />
              </div>

              <div>
                <h3 className={cn('z-20', 'relative', 'flex', 'items-center', 'gap-3', 'mb-8', 'font-bold', 'text-slate-900', 'text-xl')}>
                  <div className={cn('flex', 'justify-center', 'items-center', 'bg-blue-50', 'shadow-sm', 'border', 'border-blue-100', 'rounded-full', 'w-8', 'h-8')}>
                    <CreditCard className={cn('w-4', 'h-4', 'text-blue-500')} />
                  </div>
                  Payment Summary
                </h3>

                <div className={cn('z-20', 'relative', 'space-y-6', 'mb-8', 'text-sm')}>
                  {isPaymentDataLoading ? (
                    <div className={cn('flex', 'justify-center', 'py-4')}><Loader2 className={cn('w-6', 'h-6', 'text-blue-500', 'animate-spin')} /></div>
                  ) : (
                    <>
                      <div className={cn('flex', 'justify-between', 'items-center', 'text-slate-600')}>
                        <span className={cn('font-medium', 'text-base')}>Base Fare</span>
                        <span className={cn('font-bold', 'text-slate-800', 'text-base')}>₹{(displayAmount * 0.8).toFixed(2)}</span>
                      </div>
                      <div className={cn('flex', 'justify-between', 'items-center', 'text-slate-600')}>
                        <span className={cn('font-medium', 'text-base')}>Taxes & Fees</span>
                        <span className={cn('font-bold', 'text-slate-800', 'text-base')}>₹{(displayAmount * 0.2).toFixed(2)}</span>
                      </div>
                      <div className={cn('bg-slate-200', 'my-8', 'w-full', 'h-px')} />
                      <div className={cn('flex', 'justify-between', 'items-center')}>
                        <span className={cn('font-bold', 'text-slate-500', 'text-sm', 'uppercase', 'tracking-wide')}>Total Amount</span>
                        <span className={cn('font-black', 'text-slate-900', 'text-4xl', 'tracking-tight')}>₹{displayAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded || isPaymentDataLoading}
                className={cn('group/btn', 'z-20', 'relative', 'bg-slate-900', 'hover:bg-slate-800', 'disabled:opacity-70', 'shadow-md', 'shadow-slate-900/10', 'mt-8', 'px-6', 'py-5', 'rounded-2xl', 'w-full', 'overflow-hidden', 'font-bold', 'text-white', 'text-sm', 'uppercase', 'tracking-wider', 'active:scale-[0.98]', 'transition-all', 'disabled:cursor-not-allowed')}
              >
                <div className={cn('absolute', 'inset-0', 'bg-gradient-to-r', 'from-transparent', 'via-white/10', 'to-transparent', '-translate-x-full', 'group-hover/btn:animate-[shimmer_1.5s_infinite]')} />
                <span className={cn('z-10', 'relative', 'flex', 'justify-center', 'items-center', 'gap-2')}>
                  {isProcessing ? (
                    <><Loader2 className={cn('w-5', 'h-5', 'animate-spin')} /> PROCESSING...</>
                  ) : (
                    <>PROCEED TO PAYMENT <ChevronRight className={cn('w-5', 'h-5', 'transition-transform', 'group-hover/btn:translate-x-1')} /></>
                  )}
                </span>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
