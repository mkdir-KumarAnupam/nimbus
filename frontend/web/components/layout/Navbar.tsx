"use client";

import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    setIsDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className="fixed inset-x-0 top-6 z-50 flex w-full justify-center">

      <div className="
                flex
                h-16
                w-[90%]
                max-w-[1600px]
                items-center
                justify-between
                rounded-full
                px-6

                /* 1. Lower Opacity & High Saturation (The Refractive Effect) */
                bg-white/30
                backdrop-blur-2xl
                backdrop-saturate-150

                /* 2. Delicate Border & Inner Highlight (The 'Wet' Rim) */
                border border-white/40
                shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.6)]
            ">

        {/* Logo Area */}
        <Link href="/" className="flex shrink-0 items-center pl-2 cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <Image
            src="/logo.png"
            alt="Nimbus Logo"
            width={100}
            height={32}
            className="object-contain"
          />
        </Link>

        {/* Nav Links & CTA */}
        <NavigationMenu>
          <NavigationMenuList className="gap-2 sm:gap-4">

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-slate-700 transition-colors hover:bg-white/30 hover:text-blue-700 focus:bg-white/30 data-[state=open]:bg-white/30">
                Flights
              </NavigationMenuTrigger>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger 
                onClick={() => router.push('/my-trips')}
                className="bg-transparent text-slate-700 transition-colors hover:bg-white/30 hover:text-blue-700 focus:bg-white/30 data-[state=open]:bg-white/30 cursor-pointer"
              >
                My Trips
              </NavigationMenuTrigger>
            </NavigationMenuItem>

            <NavigationMenuItem className="ml-2 relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group relative flex items-center gap-2 rounded-full border border-blue-200 bg-white/50 px-4 py-2 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:bg-white/80 active:scale-95"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#90D5F0] text-xs font-bold text-slate-900 shadow-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      Hello, {user.username}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        {/* Invisible backdrop for clicking outside to close */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.4)] backdrop-blur-[40px] backdrop-saturate-150 z-50"
                        >
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              router.push("/profile");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-white/60 hover:text-blue-600 active:scale-95"
                          >
                            <User className="h-4 w-4" />
                            Profile & Settings
                          </button>
                          
                          <div className="my-1 h-px w-full bg-slate-200/50" />

                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 active:scale-95"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="
                                  h-10
                                  w-24
                                  rounded-full
                                  bg-[#90D5F0]
                                  text-sm
                                  font-bold
                                  text-slate-900
                                  shadow-[0_4px_14px_rgba(144,213,240,0.4)]
                                  transition-all
                                  duration-300
                                  hover:-translate-y-0.5
                                  hover:bg-[#7bc8e7]
                                  hover:shadow-[0_6px_20px_rgba(144,213,240,0.5)]
                                  active:scale-[0.98]
                                  active:translate-y-0
                              ">
                  Log in
                </button>
              )}
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

      </div>
    </header>
  );
}
