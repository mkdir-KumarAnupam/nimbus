"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Plane, QrCode, Loader2, ArrowLeft, Download, Copy, Briefcase, Luggage, CreditCard, Mail, Phone, Share2 } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";

import { useFlight } from "@/hooks/useFlight";
import { useAirports } from "@/hooks/useAirport";
import { useFlightSeats } from "@/hooks/useFlightSeats";
import { api } from "@/lib/api";
import { Ticket, getTicketByReservationId } from "@/services/ticket";
import { ReservationResponse } from "@/types/reservation";
import { getReservationPassengers } from "@/services/passenger";
import { PassengerResponse } from "@/types/passenger";
import { Spotlight } from "@/components/ui/spotlight";

export default function AllocatedTicketPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.reservationId as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [passenger, setPassenger] = useState<PassengerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const ticketRef = useRef<HTMLDivElement>(null);

  const { data: flight } = useFlight(reservation?.flightId || "");
  const { airports } = useAirports();
  const { data: seats } = useFlightSeats(reservation?.flightId || "");

  // 3D Tilt Effect Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: resData } = await api.get<ReservationResponse>(`/reservations/${reservationId}`);
        setReservation(resData);

        const passData = await getReservationPassengers(reservationId);
        if (passData && passData.length > 0) {
          setPassenger(passData[0]);
        }

        let foundTicket = null;
        let attempts = 0;
        while (!foundTicket && attempts < 10) {
          try {
            foundTicket = await getTicketByReservationId(reservationId);
          } catch (e) {
            await new Promise(r => setTimeout(r, 2000));
          }
          attempts++;
        }

        if (foundTicket) {
          setTicket(foundTicket);
        } else {
          toast.error("Ticket is still being generated. Please check your email later.");
        }
      } catch (error) {
        toast.error("Could not load reservation details.");
      } finally {
        setIsLoading(false);
      }
    }

    if (reservationId) {
      loadData();
    }
  }, [reservationId]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1,
        pixelRatio: 3,
        style: {
          transform: "none",
        }
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, (pdf.internal.pageSize.getHeight() - pdfHeight) / 2, pdfWidth, pdfHeight);
      pdf.save(`Ticket_${reservation?.reservationRef || "Booking"}.pdf`);
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 5) return phone;
    return phone.substring(0, 3) + "••••••••";
  };

  if (isLoading || !flight || !airports.length) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Retrieving your ticket details...</p>
      </div>
    );
  }

  const originAirport = airports.find((a) => a.id === flight.originAirportId);
  const destinationAirport = airports.find((a) => a.id === flight.destinationAirportId);
  const selectedSeat = seats?.find(s => s.id === reservation?.flightSeatId);

  const formatAirportName = (name?: string) => {
    if (!name) return "";
    return name.toLowerCase().includes("airport") ? name : `${name} Airport`;
  };

  // Calculate duration
  const durationMinutes = differenceInMinutes(new Date(flight.arrivalTime), new Date(flight.departureTime));
  const durationHours = Math.floor(durationMinutes / 60);
  const durationMins = durationMinutes % 60;
  const durationStr = `${durationHours}h ${durationMins}m`;

  return (
    <main className="relative min-h-screen w-screen bg-slate-50 overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6">
      {/* Light Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-50/50" />

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
              className="absolute mix-blend-multiply opacity-40 backdrop-blur-3xl border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
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
          className="absolute top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -left-[10%] w-[700px] h-[700px] rounded-full bg-indigo-300/20 blur-[120px] mix-blend-multiply"
        />
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 text-slate-600 hover:text-slate-900 flex items-center gap-2 font-semibold bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-white hover:scale-105 active:scale-95 text-sm z-20"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back Home
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 mt-6 relative z-10 flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Booking Confirmed!</h1>
        <p className="text-slate-500 mt-2 font-medium text-lg">We wish you have a great journey with us!</p>
      </motion.div>

      {/* 3D Ticket Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
        style={{ perspective: 2000 }}
        className="relative z-10 w-full flex justify-center pb-8"
      >
        <motion.div
          ref={ticketRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full max-w-[1300px] cursor-pointer flex flex-col xl:flex-row gap-8 items-center justify-center px-8 -mx-8 py-8 -my-8"
        >
          {/* Main Ticket Glass Card (Left + Right Panels) */}
          <div className="flex flex-col xl:flex-row bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative group w-full xl:w-auto flex-1 max-w-[900px]" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>

            {/* Spotlight INSIDE the ticket from top-left */}
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none z-0">
              <Spotlight className="-top-10 -left-10 xl:-top-32 xl:-left-32 scale-150 mix-blend-overlay" fill="#2563eb" />
            </div>

            {/* Shimmer/Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay z-20" />

            {/* PANE 1: Flight Info (Left) */}
            <div className="flex-1 p-8 xl:p-12 relative bg-gradient-to-br from-white/50 to-white/20 z-10" style={{ transform: "translateZ(30px)" }}>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Plane className="w-72 h-72 -rotate-12 text-blue-900" />
              </div>

              {/* Header: Nimbus Airways + Status */}
              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tighter text-slate-800 leading-none">Nimbus</span>
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Airways</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Status</span>
                  <div className="text-sm font-bold text-emerald-700 bg-emerald-100/80 backdrop-blur-sm px-5 py-1.5 rounded-full border border-emerald-200 capitalize shadow-sm text-center">
                    {ticket?.status || "Confirmed"}
                  </div>
                </div>
              </div>

              {/* Airports & Flight Route */}
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="text-left w-1/3 flex flex-col">
                  <h2 className="text-3xl font-black text-slate-800">{originAirport?.code}</h2>
                  <div className="text-sm font-semibold text-slate-600 mt-2 leading-tight pr-4">{formatAirportName(originAirport?.name) || originAirport?.city}</div>
                  <div className="mt-3">
                    <span className="text-sm font-bold text-slate-700 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-sm inline-block">
                      {format(new Date(flight.departureTime), "HH:mm")}
                    </span>
                  </div>
                </div>

                {/* Center Route Line with perfectly aligned plane */}
                <div className="flex-1 relative flex flex-col items-center justify-center min-w-[150px] mx-2 h-24">
                  {/* Dashed Line */}
                  <div className="absolute top-[40%] left-0 right-0 h-0 border-t-2 border-dashed border-slate-300"></div>

                  {/* Plane Icon */}
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 z-10">
                    <Plane className="w-6 h-6 text-blue-500" style={{ transform: "rotate(30deg)" }} />
                  </div>

                  <span className="absolute top-[75%] text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm z-10">
                    Direct • {durationStr}
                  </span>
                </div>

                <div className="text-right w-1/3 flex flex-col items-end">
                  <h2 className="text-3xl font-black text-slate-800">{destinationAirport?.code}</h2>
                  <div className="text-sm font-semibold text-slate-600 mt-2 leading-tight pl-4">{formatAirportName(destinationAirport?.name) || destinationAirport?.city}</div>
                  <div className="mt-3">
                    <span className="text-sm font-bold text-slate-700 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-sm inline-block">
                      {format(new Date(flight.arrivalTime), "HH:mm")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid (Passenger, Flight Details) */}
              <div className="bg-white/60 rounded-3xl p-6 border border-white shadow-sm backdrop-blur-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Flight No</span>
                    <span className="font-bold text-slate-800 text-base mt-1">{flight.flightNumber}</span>
                  </div>

                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Passenger</span>
                    <span className="font-bold text-slate-800 text-sm mt-1 truncate">{passenger?.firstName || "Guest"} {passenger?.lastName || ""}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</span>
                    <span className="font-bold text-slate-800 text-sm mt-1">{format(new Date(flight.departureTime), "dd MMM yyyy")}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seat / Class</span>
                    <span className="font-bold text-slate-800 text-sm mt-1 capitalize">{selectedSeat?.seatNumber || "--"} • {selectedSeat?.class || "Economy"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider 1 */}
            <div className="hidden xl:flex flex-col items-center justify-between relative px-0 py-8 bg-slate-50/50 z-10">
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l-2 border-dashed border-slate-300"></div>
              <div className="w-12 h-12 rounded-full bg-slate-50 absolute -top-6 -translate-x-1/2 left-1/2 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.05)] border-b border-slate-200"></div>
              <div className="w-12 h-12 rounded-full bg-slate-50 absolute -bottom-6 -translate-x-1/2 left-1/2 shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] border-t border-slate-200"></div>
            </div>

            <div className="xl:hidden flex flex-row items-center justify-between relative py-0 px-8 bg-slate-50/50 h-12 z-10">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0 border-t-2 border-dashed border-slate-300"></div>
              <div className="w-12 h-12 rounded-full bg-slate-50 absolute -left-6 -translate-y-1/2 top-1/2 shadow-[inset_-4px_0_6px_rgba(0,0,0,0.05)] border-r border-slate-200"></div>
              <div className="w-12 h-12 rounded-full bg-slate-50 absolute -right-6 -translate-y-1/2 top-1/2 shadow-[inset_4px_0_6px_rgba(0,0,0,0.05)] border-l border-slate-200"></div>
            </div>

            {/* PANE 2: Middle Section (QR & PNR) */}
            <div className="xl:w-[280px] p-8 bg-slate-50/60 flex flex-col items-center justify-center relative z-10" style={{ transform: "translateZ(20px)" }}>
              <div className="mb-6 w-full text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">PNR / Reservation</span>
                <span className="relative font-mono text-xl font-bold text-slate-800 bg-white/80 py-1.5 rounded-xl border border-white shadow-sm tracking-[0.1em] flex items-center justify-center w-full">
                  <span>{reservation?.reservationRef || "PENDING"}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(reservation?.reservationRef || "", "PNR"); }}
                    className="absolute right-1 p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                    title="Copy PNR"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </span>
              </div>

              <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 mb-6 relative group/qr transition-transform hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-3xl opacity-0 group-hover/qr:opacity-100 transition-opacity mix-blend-multiply" />
                <div className="relative z-10 w-32 h-32 flex items-center justify-center p-1 bg-white rounded-xl">
                  {shareUrl ? (
                    <QRCode value={shareUrl} size={128} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                  ) : (
                    <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg"></div>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Ticket Number</span>
                <span className="relative font-bold text-slate-700 text-sm inline-flex items-center justify-center group/ticket">
                  <span>{ticket?.ticketNumber || "PROCESSING"}</span>
                  {ticket?.ticketNumber && (
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(ticket.ticketNumber, "Ticket Number"); }}
                      className="absolute left-[calc(100%+8px)] p-1.5 opacity-0 group-hover/ticket:opacity-100 hover:bg-slate-200 rounded-md transition-all text-slate-400 hover:text-slate-600"
                      title="Copy Ticket Number"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* DISCONNECTED SECTION: Right Side Information (Contact & Baggage) */}
          <div className="flex flex-col gap-6 w-full xl:w-[300px]" style={{ transform: "translateZ(20px)" }}>

            {/* Contact & Payment Info Card */}
            <div className="w-full bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] space-y-4 overflow-hidden" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Razorpay</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Paid</span>
                </div>
              </div>

              <div className="h-px w-full bg-slate-200/60" />

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium truncate flex-1">{passenger?.email || "guest@email.com"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium flex-1">{maskPhone(passenger?.phone || "") || "+91••••••••"}</span>
                </div>
              </div>
            </div>

            {/* Baggage Allowance Card */}
            <div className="w-full bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col gap-4 overflow-hidden" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Baggage Allowance</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-100 transition-colors hover:bg-white">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-semibold">Cabin</span>
                </div>
                <span className="text-sm font-black text-slate-800">7 kg</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-100 transition-colors hover:bg-white">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                    <Luggage className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-sm font-semibold">Checked</span>
                </div>
                <span className="text-sm font-black text-slate-800">20 kg</span>
              </div>
            </div>

          </div>

        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex flex-wrap justify-center gap-4 relative z-20"
      >
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="group bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 disabled:opacity-70 disabled:hover:scale-100 text-base"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isDownloading ? "Generating PDF..." : "Download Ticket PDF"}
        </button>

        <button
          onClick={() => copyToClipboard(shareUrl, "Ticket Link")}
          className="group bg-white hover:bg-blue-50 text-slate-700 px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 border border-slate-200 text-base"
        >
          Share Ticket Link
        </button>
      </motion.div>

    </main>
  );
}
