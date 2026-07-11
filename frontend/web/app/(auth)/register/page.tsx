"use client";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 selection:bg-blue-500/30 px-6 py-20">
      
      {/* Lightweight Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,#f8fafc,#eff6ff,#f1f5f9,#eef2ff)] bg-[length:400%_400%] animate-gradient-x opacity-80" />
      
      {/* Subtle grid overlay for texture (very lightweight) */}
      <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <RegisterForm />
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </main>
  );
}
