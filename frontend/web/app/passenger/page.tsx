"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Calendar, Globe, CreditCard, Flag, FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";

const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),

  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  passportCountry: z.string().optional(),

  mealPreference: z.string().optional(),
  specialAssistance: z.string().optional(),
  frequentFlyerNumber: z.string().optional(),
});

type PassengerFormValues = z.infer<typeof passengerSchema>;

export default function PassengerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      gender: "male",
    },
  });

  const onSubmit = async (data: PassengerFormValues) => {
    setIsLoading(true);
    try {
      // In a real flow, this would call createPassenger(reservationId, data)
      console.log("Passenger data:", data);
      
      toast.success("Passenger details saved successfully!");
      // Proceed to payment or confirmation
      // router.push("/payment");
      
    } catch (error) {
      toast.error("Failed to save passenger details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full rounded-2xl border bg-white/70 px-5 py-[16px] text-[15px] text-slate-900 font-medium placeholder:text-slate-500 placeholder:font-medium outline-none backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-sm focus:bg-white focus:shadow-[0_4px_25px_rgba(144,213,240,0.4)] focus:-translate-y-0.5 ${
      hasError ? "border-red-400 focus:border-red-500" : "border-white focus:border-[#90D5F0]"
    }`;

  const iconClasses = "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/input:text-[#7bc8e7] transition-colors duration-300";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 selection:bg-blue-500/30 px-6 py-28">
      {/* Lightweight Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,#f8fafc,#eff6ff,#f1f5f9,#eef2ff)] bg-[length:400%_400%] animate-gradient-x opacity-80" />
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="group relative w-full"
        >
          {/* Animated Border Beam */}
          <div
            className="z-20 absolute inset-[-1px] rounded-[2.5rem] pointer-events-none"
            style={{
              padding: '1.5px',
              maskImage: 'linear-gradient(white, white), linear-gradient(white, white)',
              maskClip: 'content-box, border-box',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
            }}
          >
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_75%,#90D5F0_100%)] opacity-0 group-hover:opacity-100 transition-opacity animate-[spin_4s_linear_infinite] duration-500" />
          </div>

          {/* Glass Container */}
          <Spotlight fill="#90D5F0" className="left-20 w-98" />
          <div className="relative bg-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.4),inset_0_1px_20px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_48px_rgba(144,213,240,0.25),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_20px_rgba(255,255,255,1)] backdrop-blur-[40px] backdrop-saturate-150 p-8 sm:p-12 border border-white/60 rounded-[2.5rem] transition-all duration-500">
            
            {/* Subtle outer glow */}
            <div className="absolute inset-0 shadow-[0_0_80px_rgba(144,213,240,0.25)] rounded-[2.5rem] pointer-events-none" />

            <div className="z-10 relative mb-10 text-center sm:text-left">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-3 font-medium text-[2.5rem] text-slate-900 tracking-tight"
              >
                Passenger Details
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-medium text-[15px] text-slate-500 leading-relaxed max-w-lg"
              >
                Please enter the details exactly as they appear on the passenger's government-issued identification.
              </motion.p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="z-10 relative space-y-10">
              
              {/* Section 1: Personal Information */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-200/50 pb-3">
                  <User className="w-5 h-5 text-[#90D5F0]" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="group/input relative">
                    <input type="text" placeholder="First Name" {...register("firstName")} disabled={isLoading} className={inputClasses(!!errors.firstName)} />
                    <User className={iconClasses} strokeWidth={2} size={18} />
                    {errors.firstName && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.firstName.message}</p>}
                  </div>
                  <div className="group/input relative">
                    <input type="text" placeholder="Last Name" {...register("lastName")} disabled={isLoading} className={inputClasses(!!errors.lastName)} />
                    <User className={iconClasses} strokeWidth={2} size={18} />
                    {errors.lastName && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.lastName.message}</p>}
                  </div>
                  <div className="group/input relative">
                    <select {...register("gender")} disabled={isLoading} className={`${inputClasses(!!errors.gender)} appearance-none`}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.gender.message}</p>}
                  </div>
                  <div className="group/input relative">
                    <input type="date" {...register("dateOfBirth")} disabled={isLoading} className={inputClasses(!!errors.dateOfBirth)} />
                    {errors.dateOfBirth && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.dateOfBirth.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Section 2: Contact Information */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-200/50 pb-3">
                  <Mail className="w-5 h-5 text-[#90D5F0]" /> Contact & Nationality
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="group/input relative">
                    <input type="text" placeholder="Nationality" {...register("nationality")} disabled={isLoading} className={inputClasses(!!errors.nationality)} />
                    <Globe className={iconClasses} strokeWidth={2} size={18} />
                    {errors.nationality && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.nationality.message}</p>}
                  </div>
                  <div className="group/input relative">
                    <input type="email" placeholder="Email Address" {...register("email")} disabled={isLoading} className={inputClasses(!!errors.email)} />
                    <Mail className={iconClasses} strokeWidth={2} size={18} />
                    {errors.email && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.email.message}</p>}
                  </div>
                  <div className="group/input relative">
                    <input type="tel" placeholder="Phone Number" {...register("phone")} disabled={isLoading} className={inputClasses(!!errors.phone)} />
                    <Phone className={iconClasses} strokeWidth={2} size={18} />
                    {errors.phone && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.phone.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Section 3: Passport (Optional) */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-200/50 pb-3">
                  <CreditCard className="w-5 h-5 text-[#90D5F0]" /> Passport Details <span className="text-slate-400 font-normal text-sm ml-2">(Optional for domestic)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="group/input relative">
                    <input type="text" placeholder="Passport Number" {...register("passportNumber")} disabled={isLoading} className={inputClasses(!!errors.passportNumber)} />
                    <CreditCard className={iconClasses} strokeWidth={2} size={18} />
                  </div>
                  <div className="group/input relative flex flex-col justify-center">
                    <label className="text-xs text-slate-500 mb-1 ml-2 font-medium">Expiry Date</label>
                    <input type="date" {...register("passportExpiry")} disabled={isLoading} className={inputClasses(!!errors.passportExpiry)} />
                  </div>
                  <div className="group/input relative flex flex-col justify-end">
                    <input type="text" placeholder="Issuing Country" {...register("passportCountry")} disabled={isLoading} className={inputClasses(!!errors.passportCountry)} />
                    <Flag className={iconClasses} strokeWidth={2} size={18} />
                  </div>
                </div>
              </motion.div>

              {/* Section 4: Preferences (Optional) */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }} className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-200/50 pb-3">
                  <FileText className="w-5 h-5 text-[#90D5F0]" /> Preferences & Extras <span className="text-slate-400 font-normal text-sm ml-2">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="group/input relative">
                    <input type="text" placeholder="Meal Preference" {...register("mealPreference")} disabled={isLoading} className={inputClasses(!!errors.mealPreference)} />
                  </div>
                  <div className="group/input relative">
                    <input type="text" placeholder="Special Assistance" {...register("specialAssistance")} disabled={isLoading} className={inputClasses(!!errors.specialAssistance)} />
                  </div>
                  <div className="group/input relative">
                    <input type="text" placeholder="Frequent Flyer No." {...register("frequentFlyerNumber")} disabled={isLoading} className={inputClasses(!!errors.frequentFlyerNumber)} />
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }} className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/btn relative bg-[#90D5F0]/90 backdrop-blur-md border border-white/80 disabled:opacity-70 shadow-[0_8px_32px_rgba(144,213,240,0.4),inset_0_0_0_1px_rgba(255,255,255,0.6),inset_0_1px_20px_rgba(255,255,255,1)] hover:bg-[#90D5F0] hover:shadow-[0_16px_48px_rgba(144,213,240,0.5),inset_0_0_0_1px_rgba(255,255,255,0.8),inset_0_1px_20px_rgba(255,255,255,1)] py-[18px] px-10 rounded-full overflow-hidden font-bold text-[16px] text-slate-900 active:scale-[0.98] transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 duration-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">
                    {isLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving...</span>
                    ) : (
                      <span className="flex items-center gap-2">Continue to Payment <ChevronRight className="w-5 h-5" /></span>
                    )}
                  </span>
                </button>
              </motion.div>

            </form>
          </div>

          <style>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-gradient-x {
              animation: gradient-x 15s ease infinite;
            }
          `}</style>
        </motion.div>
      </div>
    </main>
  );
}
