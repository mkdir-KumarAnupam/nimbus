"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as registerUser } from "@/services/auth";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { cn } from "../../lib/utils";
import { Spotlight } from "../ui/spotlight";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success("Account created successfully! Please log in.");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ??
          "Failed to register. Please try again."
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn('relative', 'w-full', 'max-w-[500px]', 'group')}
    >
      {/* Animated Border Beam (Masked strictly to the border) */}
      <div
        className={cn('absolute', 'inset-[-1px]', 'rounded-[2rem]', 'pointer-events-none', 'z-20')}
        style={{
          padding: '1.5px',
          maskImage: 'linear-gradient(white, white), linear-gradient(white, white)',
          maskClip: 'content-box, border-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      >
        <div className={cn('absolute', 'inset-[-100%]', 'animate-[spin_4s_linear_infinite]', 'bg-[conic-gradient(from_0deg,transparent_75%,#90D5F0_100%)]', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-500')} />
      </div>

      {/* Glass Container */}
      <Spotlight fill="#90D5F0" className={cn('left-20', 'w-98')} />
      <div className={cn('relative', 'rounded-[2rem]', 'border', 'border-white/60', 'bg-white/50', 'p-10', 'sm:p-12', 'backdrop-blur-[40px]', 'backdrop-saturate-150', 'shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.4),inset_0_1px_20px_rgba(255,255,255,0.9)]', 'transition-all', 'duration-500', 'hover:shadow-[0_16px_48px_rgba(144,213,240,0.25),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_20px_rgba(255,255,255,1)]')}>

        {/* Subtle outer glow that mimics the blue edge glow in the reference */}
        <div className={cn('absolute', 'inset-0', 'rounded-[2rem]', 'shadow-[0_0_80px_rgba(144,213,240,0.25)]', 'pointer-events-none')} />

        <div className={cn('mb-10', 'text-center', 'relative', 'z-10')}>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={cn('text-[2.5rem]', 'font-medium', 'tracking-tight', 'text-slate-900', 'mb-4')}
          >
            Sign up
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={cn('text-[15px]', 'font-medium', 'leading-relaxed', 'text-slate-500', 'max-w-[340px]', 'mx-auto')}
          >
            Create an account to manage your flights, bookings, and easily pick up right where you left off.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', 'relative', 'z-10')}>
          {/* Username Field */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <div className={cn('relative', 'group/input')}>
              <div className={cn('absolute', 'inset-y-0', 'left-0', 'flex', 'items-center', 'pl-5', 'pointer-events-none', 'text-slate-400', 'group-focus-within/input:text-[#7bc8e7]', 'transition-colors', 'duration-300')}>
                <User className={cn('h-[18px]', 'w-[18px]', 'group-focus-within/input:scale-110', 'transition-transform', 'duration-300')} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Enter your username"
                disabled={isLoading}
                {...register("username")}
                autoComplete="username"
                className={`w-full rounded-full border bg-white/70 pl-[3.25rem] pr-6 py-[18px] text-[15px] text-slate-900 font-medium placeholder:text-slate-500 placeholder:font-medium outline-none backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-sm focus:bg-white focus:shadow-[0_4px_25px_rgba(144,213,240,0.4)] focus:-translate-y-0.5 ${errors.username ? "border-red-400 focus:border-red-500" : "border-white focus:border-[#90D5F0]"
                  }`}
              />
            </div>
            {errors.username && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={cn('mt-2', 'text-xs', 'font-semibold', 'text-red-500', 'ml-4')}>
                {errors.username.message}
              </motion.p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <div className={cn('relative', 'group/input')}>
              <div className={cn('absolute', 'inset-y-0', 'left-0', 'flex', 'items-center', 'pl-5', 'pointer-events-none', 'text-slate-400', 'group-focus-within/input:text-[#7bc8e7]', 'transition-colors', 'duration-300')}>
                <Mail className={cn('h-[18px]', 'w-[18px]', 'group-focus-within/input:scale-110', 'transition-transform', 'duration-300')} strokeWidth={2.5} />
              </div>
              <input
                type="email"
                placeholder="Enter your email address"
                disabled={isLoading}
                {...register("email")}
                autoComplete="email"
                className={`w-full rounded-full border bg-white/70 pl-[3.25rem] pr-6 py-[18px] text-[15px] text-slate-900 font-medium placeholder:text-slate-500 placeholder:font-medium outline-none backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-sm focus:bg-white focus:shadow-[0_4px_25px_rgba(144,213,240,0.4)] focus:-translate-y-0.5 ${errors.email ? "border-red-400 focus:border-red-500" : "border-white focus:border-[#90D5F0]"
                  }`}
              />
            </div>
            {errors.email && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={cn('mt-2', 'text-xs', 'font-semibold', 'text-red-500', 'ml-4')}>
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
            <div className={cn('relative', 'group/input')}>
              <div className={cn('absolute', 'inset-y-0', 'left-0', 'flex', 'items-center', 'pl-5', 'pointer-events-none', 'text-slate-400', 'group-focus-within/input:text-[#7bc8e7]', 'transition-colors', 'duration-300')}>
                <Lock className={cn('h-[18px]', 'w-[18px]', 'group-focus-within/input:scale-110', 'transition-transform', 'duration-300')} strokeWidth={2.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={isLoading}
                {...register("password")}
                autoComplete="new-password"
                className={`w-full rounded-full border bg-white/70 pl-[3.25rem] pr-12 py-[18px] text-[15px] text-slate-900 font-medium placeholder:text-slate-500 placeholder:font-medium outline-none backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-sm focus:bg-white focus:shadow-[0_4px_25px_rgba(144,213,240,0.4)] focus:-translate-y-0.5 ${errors.password ? "border-red-400 focus:border-red-500" : "border-white focus:border-[#90D5F0]"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn('absolute', 'inset-y-0', 'right-0', 'flex', 'items-center', 'pr-5', 'text-slate-400', 'hover:text-slate-600', 'transition-colors')}
              >
                {showPassword ? (
                  <EyeOff className={cn('h-[18px]', 'w-[18px]')} strokeWidth={2.5} />
                ) : (
                  <Eye className={cn('h-[18px]', 'w-[18px]')} strokeWidth={2.5} />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={cn('mt-2', 'text-xs', 'font-semibold', 'text-red-500', 'ml-4')}>
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
            type="submit"
            disabled={isLoading}
            className={cn('relative', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-[#90D5F0]/90', 'backdrop-blur-md', 'border', 'border-white/80', 'mt-8', 'py-[18px]', 'text-[16px]', 'font-bold', 'text-slate-900', 'shadow-[0_8px_32px_rgba(144,213,240,0.4),inset_0_0_0_1px_rgba(255,255,255,0.6),inset_0_1px_20px_rgba(255,255,255,1)]', 'transition-all', 'duration-300', 'hover:bg-[#90D5F0]', 'hover:shadow-[0_16px_48px_rgba(144,213,240,0.5),inset_0_0_0_1px_rgba(255,255,255,0.8),inset_0_1px_20px_rgba(255,255,255,1)]', 'hover:-translate-y-0.5', 'active:scale-[0.98]', 'disabled:opacity-70', 'disabled:hover:translate-y-0', 'disabled:cursor-not-allowed', 'group/btn')}
          >
            {/* Button shimmer effect */}
            <div className={cn('absolute', 'inset-0', '-translate-x-full', 'bg-gradient-to-r', 'from-transparent', 'via-white/20', 'to-transparent', 'group-hover/btn:animate-[shimmer_1.5s_infinite]')} />

            <div className={cn('relative', 'flex', 'items-center', 'justify-center', 'gap-2')}>
              {isLoading ? (
                <>
                  <Loader2 className={cn('h-5', 'w-5', 'animate-spin')} />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Sign up</span>
              )}
            </div>
          </motion.button>

          {/* Social Login Row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className={cn('flex', 'items-center', 'justify-between', 'gap-3', 'mt-6')}>
            <button type="button" className={cn('flex-1', 'flex', 'items-center', 'justify-center', 'gap-2', 'rounded-full', 'border', 'border-white/80', 'bg-white/60', 'backdrop-blur-md', 'py-3.5', 'text-[14px]', 'font-semibold', 'text-slate-700', 'shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_10px_rgba(255,255,255,0.8)]', 'transition-all', 'duration-300', 'hover:bg-white/80', 'hover:shadow-[0_8px_25px_rgba(144,213,240,0.2),inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_1px_15px_rgba(255,255,255,1)]', 'hover:-translate-y-0.5', 'active:scale-95', 'group/social')}>
              <svg className={cn('w-[18px]', 'h-[18px]', 'text-[#1877F2]', 'group-hover/social:scale-110', 'transition-transform', 'duration-300')} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
            <button type="button" className={cn('flex-1', 'flex', 'items-center', 'justify-center', 'gap-2', 'rounded-full', 'border', 'border-white/80', 'bg-white/60', 'backdrop-blur-md', 'py-3.5', 'text-[14px]', 'font-semibold', 'text-slate-700', 'shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_10px_rgba(255,255,255,0.8)]', 'transition-all', 'duration-300', 'hover:bg-white/80', 'hover:shadow-[0_8px_25px_rgba(144,213,240,0.2),inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_1px_15px_rgba(255,255,255,1)]', 'hover:-translate-y-0.5', 'active:scale-95', 'group/social')}>
              <svg className={cn('w-[18px]', 'h-[18px]', 'group-hover/social:scale-110', 'transition-transform', 'duration-300')} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </button>
            <button type="button" className={cn('flex-1', 'flex', 'items-center', 'justify-center', 'gap-2', 'rounded-full', 'border', 'border-white/80', 'bg-white/60', 'backdrop-blur-md', 'py-3.5', 'text-[14px]', 'font-semibold', 'text-slate-700', 'shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_1px_10px_rgba(255,255,255,0.8)]', 'transition-all', 'duration-300', 'hover:bg-white/80', 'hover:shadow-[0_8px_25px_rgba(144,213,240,0.2),inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_1px_15px_rgba(255,255,255,1)]', 'hover:-translate-y-0.5', 'active:scale-95', 'group/social')}>
              <svg className={cn('w-[18px]', 'h-[18px]', 'text-slate-900', 'group-hover/social:scale-110', 'transition-transform', 'duration-300')} fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.43.987 3.96.948 1.567-.026 2.559-1.474 3.55-2.923 1.156-1.678 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.68.727-1.35 2.155-1.155 3.505 1.35.104 2.648-.481 3.441-1.494z" /></svg>
              Apple
            </button>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className={cn('mt-8', 'text-center', 'text-[14px]', 'font-medium', 'text-slate-500')}>
            Already have an account?{" "}
            <a
              href="/login"
              className={cn('text-[#7bc8e7]', 'transition-colors', 'hover:text-[#90D5F0]', 'hover:underline')}
            >
              Log in
            </a>
          </motion.p>
        </form>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
}
