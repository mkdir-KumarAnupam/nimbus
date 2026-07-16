"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { User, Mail, Phone, Globe, CreditCard, Flag, FileText, Loader2, ArrowLeft, Plus, Trash2, Edit2, Check, X, Users, Settings, ChevronRight, UserPlus, UserCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import Navbar from "@/components/layout/Navbar";
import { Spotlight } from "@/components/ui/spotlight";
import { SavedPassenger } from "@/types/passenger";
import { getSavedPassengers, createSavedPassenger, updateSavedPassenger, deleteSavedPassenger } from "@/services/savedPassenger";
import { COUNTRIES } from "@/lib/countries";
import DOBDatePicker from "@/components/booking/date/DOBDatePicker";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const passengerSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date({ message: "Required" }),
  nationality: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Required"),
  passportNumber: z.string().optional(),
  passportExpiry: z.date().optional(),
  passportCountry: z.string().optional(),
  mealPreference: z.string().optional(),
  specialAssistance: z.string().optional(),
  frequentFlyerNumber: z.string().optional(),
});

type PassengerFormValues = z.infer<typeof passengerSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [passengers, setPassengers] = useState<SavedPassenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<SavedPassenger | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [expiryPickerOpen, setExpiryPickerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const stepsList = [
    { id: 1, title: "Personal" },
    { id: 2, title: "Contact" },
    { id: 3, title: "Optional" }
  ];

  const { register, handleSubmit, setValue, watch, reset, trigger, formState: { errors } } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: { gender: "male" }
  });

  const dobValue = watch("dateOfBirth");
  const expiryValue = watch("passportExpiry");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchPassengers();
  }, [user]);

  const fetchPassengers = async () => {
    setIsLoading(true);
    try {
      const data = await getSavedPassengers();
      setPassengers(data || []);
    } catch (e) {
      toast.error("Failed to load saved passengers");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPassenger(null);
    reset({ gender: "male" });
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (p: SavedPassenger) => {
    setEditingPassenger(p);
    reset({
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender as any,
      dateOfBirth: new Date(p.dateOfBirth),
      nationality: p.nationality,
      email: p.email,
      phone: p.phone,
      passportNumber: p.passportNumber || "",
      passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : undefined,
      passportCountry: p.passportCountry || "",
      mealPreference: p.mealPreference || "",
      specialAssistance: p.specialAssistance || "",
      frequentFlyerNumber: p.frequentFlyerNumber || "",
    });
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedPassenger(id);
      setPassengers(prev => prev.filter(p => p.id !== id));
      toast.success("Passenger deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const onSubmit = async (data: PassengerFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString(),
        passportExpiry: data.passportExpiry ? data.passportExpiry.toISOString() : undefined,
      };

      if (editingPassenger) {
        await updateSavedPassenger(editingPassenger.id, payload);
        toast.success("Passenger updated");
      } else {
        await createSavedPassenger(payload);
        toast.success("Passenger saved");
      }
      setIsModalOpen(false);
      fetchPassengers();
    } catch (e) {
      toast.error("Failed to save passenger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof PassengerFormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = ["firstName", "lastName", "gender", "dateOfBirth"];
    if (currentStep === 2) fieldsToValidate = ["nationality", "email", "phone"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }
  };

  const inputClasses = (hasErr: boolean) => 
    `w-full bg-white/60 border ${
      hasErr ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 focus:bg-white"
    } rounded-2xl px-4 py-3.5 pl-11 text-sm font-semibold text-slate-800 placeholder:text-slate-500 outline-none transition-all duration-300 shadow-sm hover:bg-white/80 hover:shadow-md hover:border-slate-300 focus:-translate-y-0.5 focus:shadow-lg focus:scale-[1.01]`;

  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500/70 group-hover/input:text-blue-500 group-focus-within/input:text-blue-600 group-focus-within/input:scale-110 transition-all duration-300";

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 relative overflow-hidden pb-32 pt-28">
        {/* Deep Liquid Glass Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen opacity-50" fill="#3b82f6" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-300/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="mb-12 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Saved Passengers</h1>
              <p className="text-slate-500 mt-3 text-lg max-w-xl leading-relaxed">Manage passenger details for quick checkout.</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-white/40 backdrop-blur-xl border border-white/60 text-slate-800 hover:bg-white/50 px-6 py-3.5 rounded-full font-bold shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add New
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center">
            <div className="w-full flex flex-col gap-2">
              <button className="flex items-center gap-3 w-full px-5 py-3.5 bg-blue-50/80 text-blue-700 rounded-2xl font-bold transition-all shadow-sm">
                <Users className="w-5 h-5" /> Saved Passengers
              </button>
              <button className="flex items-center gap-3 w-full px-5 py-3.5 text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 rounded-2xl font-semibold transition-all">
                <Settings className="w-5 h-5" /> Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : passengers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="col-span-full bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-16 text-center shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                    <Users className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-3">No saved passengers</h3>
                  <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                    Add passengers to speed up your booking process.
                  </p>
                </div>
              </motion.div>
            ) : (
              passengers.map(p => (
                <div key={p.id} className="group relative bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white/40 overflow-hidden transition-all duration-500 p-8 flex flex-col">
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6 border-b border-slate-200/50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{p.firstName} {p.lastName}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.nationality} • {p.gender}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      {p.email}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      {p.phone}
                    </div>
                    {p.passportNumber && (
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        </div>
                        {p.passportNumber}
                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/10 backdrop-blur-[8px]" onClick={() => setIsModalOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2.5rem] p-6 sm:p-10 scrollbar-hide"
            >
              
              <div className="relative z-10">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-0 right-0 p-2 bg-white/20 text-slate-500 hover:bg-white/40 hover:text-slate-800 rounded-full transition-all backdrop-blur-md border border-white/30 shadow-sm">
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60 pr-10">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-[inset_0_1px_2px_rgba(255,255,255,1)]">
                    {editingPassenger ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                    {editingPassenger ? "Edit Passenger" : "Add New Passenger"}
                  </h2>
                </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (currentStep === stepsList.length) {
                  handleSubmit(onSubmit)(e);
                } else {
                  handleNext();
                }
              }} className="flex flex-col gap-5 relative z-10">
                
                <div className="relative">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.4, type: "spring", bounce: 0.3 }} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group/input relative">
                          <input type="text" {...register("firstName")} className={inputClasses(!!errors.firstName)} placeholder="First Name" />
                          <User className={iconClasses} strokeWidth={2} size={18} />
                          {errors.firstName && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.firstName.message}</p>}
                        </div>
                        <div className="group/input relative">
                          <input type="text" {...register("lastName")} className={inputClasses(!!errors.lastName)} placeholder="Last Name" />
                          <User className={iconClasses} strokeWidth={2} size={18} />
                          {errors.lastName && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group/input relative">
                          <select {...register("gender")} className={`${inputClasses(!!errors.gender)} appearance-none`}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.gender && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.gender.message}</p>}
                        </div>
                        <div className="group/input relative">
                          <DOBDatePicker open={dobPickerOpen} onOpenChange={setDobPickerOpen} selected={dobValue} onSelect={d => setValue("dateOfBirth", d as Date, { shouldValidate: true })}>
                            <button type="button" onClick={() => setDobPickerOpen(true)} className={`${inputClasses(!!errors.dateOfBirth)} text-left flex items-center`}>
                              <span className={dobValue ? "text-slate-900" : "text-slate-500/70 font-normal"}>{dobValue ? format(dobValue, "dd MMM yyyy") : "Date of Birth"}</span>
                            </button>
                          </DOBDatePicker>
                          <FileText className={iconClasses} strokeWidth={2} size={18} />
                          {errors.dateOfBirth && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.dateOfBirth.message as string}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.4, type: "spring", bounce: 0.3 }} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group/input relative">
                          <input type="text" {...register("nationality")} className={inputClasses(!!errors.nationality)} placeholder="Nationality" />
                          <Globe className={iconClasses} strokeWidth={2} size={18} />
                          {errors.nationality && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.nationality.message}</p>}
                        </div>
                        <div className="group/input relative">
                          <input type="tel" {...register("phone")} className={inputClasses(!!errors.phone)} placeholder="Phone" />
                          <Phone className={iconClasses} strokeWidth={2} size={18} />
                          {errors.phone && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.phone.message}</p>}
                        </div>
                      </div>

                      <div className="group/input relative">
                        <input type="email" {...register("email")} className={inputClasses(!!errors.email)} placeholder="Email Address" />
                        <Mail className={iconClasses} strokeWidth={2} size={18} />
                        {errors.email && <p className="mt-1.5 ml-2 font-semibold text-red-500 text-xs">{errors.email.message}</p>}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.4, type: "spring", bounce: 0.3 }} className="flex flex-col gap-4">
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-dashed border-slate-300/60 pb-2">Optional Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group/input relative">
                          <input type="text" {...register("passportNumber")} className={inputClasses(!!errors.passportNumber)} placeholder="Passport Number" />
                          <CreditCard className={iconClasses} strokeWidth={2} size={18} />
                        </div>
                        <div className="group/input relative">
                          <DOBDatePicker open={expiryPickerOpen} onOpenChange={setExpiryPickerOpen} selected={expiryValue} isExpiry onSelect={d => setValue("passportExpiry", d as Date, { shouldValidate: true })}>
                            <button type="button" onClick={() => setExpiryPickerOpen(true)} className={`${inputClasses(!!errors.passportExpiry)} text-left flex items-center`}>
                              <span className={expiryValue ? "text-slate-900" : "text-slate-500/70 font-normal"}>{expiryValue ? format(expiryValue, "dd MMM yyyy") : "Passport Expiry"}</span>
                            </button>
                          </DOBDatePicker>
                          <FileText className={iconClasses} strokeWidth={2} size={18} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>


                <div className="flex justify-between items-center mt-2 pt-5 border-t border-slate-200/60">
                  {currentStep > 1 ? (
                    <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 rounded-full text-sm font-bold text-slate-700 bg-white/50 hover:bg-white/80 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95">Back</button>
                  ) : (
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full text-sm font-bold text-slate-700 bg-white/50 hover:bg-white/80 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95">Cancel</button>
                  )}


                  
                  {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-blue-700 bg-blue-400/20 hover:bg-blue-400/30 backdrop-blur-xl border border-blue-300/50 shadow-sm hover:shadow-md transition-all active:scale-95 hover:-translate-y-0.5">
                      Next Step <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button type="submit" disabled={isSaving} className="group flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-blue-700 bg-blue-400/20 hover:bg-blue-400/30 backdrop-blur-xl border border-blue-300/50 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 hover:-translate-y-0.5">
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Passenger
                    </button>
                  )}
                </div>

              </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
    </>
  );
}
