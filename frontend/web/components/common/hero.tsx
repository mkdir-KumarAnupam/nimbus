"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SearchForm } from "@/components/flight/SearchForm";
import HeroBackground from "@/components/common/hero-background";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "../../lib/utils";

const WORDS = ["journey.", "destination.", "goal"];

export function Hero() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[wordIndex];
    const typeSpeed = isDeleting ? 35 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % WORDS.length);
      } else {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex]);

  return (
    <section className={cn('relative', 'overflow-hidden')}>
      <HeroBackground />

      <Spotlight fill="#70CBF6" className={cn('left-150', 'opacity-10')} />
      <div
        className={cn('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'opacity-[0.035]')}
        aria-hidden="true"
      >
        <img
          src="/img.png"
          alt=""
          className={cn('h-auto', 'w-[92%]', 'max-w-[1700px]', 'select-none', 'object-contain')}
          draggable={false}
        />
      </div>



      <div className={cn('relative', 'container', 'mx-auto', 'flex', 'min-h-[100vh]', 'max-w-7xl', 'flex-col', 'items-center', 'justify-center', 'px-6', 'pt-48', 'pb-16')}>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className={cn('pointer-events-none', 'absolute', 'left-[2%]', 'top-[20%]', 'z-0', 'hidden', 'lg:flex', 'flex-col', 'gap-1', 'rounded-2xl', 'border', 'border-white/60', 'bg-white/40', 'p-5', 'shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_1px_10px_rgba(255,255,255,0.8)]', 'backdrop-blur-md')}
        >
          <span className={cn('text-xs', 'font-extrabold', 'uppercase', 'tracking-widest', 'text-[#90D5F0]')}>Trending</span>
          <span className={cn('text-lg', 'font-bold', 'text-slate-800')}>Tokyo, Japan</span>
          <span className={cn('text-sm', 'font-medium', 'text-slate-500')}>From ₹70000</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className={cn('pointer-events-none', 'absolute', 'right-[2%]', 'top-[30%]', 'z-0', 'hidden', 'lg:flex', 'items-center', 'gap-4', 'rounded-2xl', 'border', 'border-white/60', 'bg-white/40', 'p-3', 'pr-6', 'shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_1px_10px_rgba(255,255,255,0.8)]', 'backdrop-blur-md')}
        >

          <div className={cn('flex', 'flex-col')}>
            <span className={cn('text-sm', 'font-bold', 'text-slate-800')}>NYC → LON</span>
            <span className={cn('text-xs', 'font-semibold', 'text-slate-500')}>Direct • 7h 20m</span>
          </div>
        </motion.div>


        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className={cn('pointer-events-none', 'absolute', 'right-[15%]', 'bottom-[20%]', 'z-0', 'hidden', 'xl:flex', 'items-center', 'gap-3', 'rounded-full', 'border', 'border-white/60', 'bg-white/40', 'px-5', 'py-2.5', 'shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_1px_10px_rgba(255,255,255,0.8)]', 'backdrop-blur-md')}
        >
          <span className={cn('relative', 'flex', 'h-3', 'w-3')}>
            <span className={cn('animate-ping', 'absolute', 'inline-flex', 'h-full', 'w-full', 'rounded-full', 'bg-[#90D5F0]', 'opacity-75')}></span>
            <span className={cn('relative', 'inline-flex', 'rounded-full', 'h-3', 'w-3', 'bg-[#7bc8e7]')}></span>
          </span>
          <span className={cn('text-sm', 'font-bold', 'text-slate-800')}>Live Prices</span>
        </motion.div>

        <div className={cn('relative', 'z-10', 'mx-auto', 'max-w-3xl', 'text-center')}>



          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={cn('text-4xl', 'font-semibold', 'tracking-tight', 'text-slate-900', 'md:text-5xl', 'lg:text-[3.5rem]', 'lg:leading-tight')}
          >
            Find your next{" "}

            <span className="text-blue-600">
              {text}
              <span className={cn('animate-pulse', 'font-light', 'text-slate-300')}>|</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className={cn('mx-auto', 'mt-6', 'max-w-xl', 'text-base', 'font-medium', 'leading-relaxed', 'text-slate-500', 'md:text-lg')}
          >
            Search, compare, and book flights globally with a clean, seamless experience.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className={cn('mt-10', 'w-full', 'sm:mt-12')}
        >
          <SearchForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className={cn('mt-8', 'flex', 'flex-wrap', 'items-center', 'justify-center', 'gap-4', 'sm:gap-6')}
        >
          {/* Rating Pill */}
          <div className={cn('group', 'flex', 'cursor-default', 'items-center', 'gap-2.5', 'rounded-full', 'border', 'border-white/40', 'bg-white/10', 'px-5', 'py-2.5', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'shadow-[0_8px_20px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.6)]', 'transition-all', 'duration-500', 'ease-[cubic-bezier(0.23,1,0.32,1)]', 'hover:-translate-y-0.5', 'hover:scale-[1.015]', 'hover:bg-white/20', 'hover:shadow-[0_12px_24px_rgba(37,99,235,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)]')}>
            <span className={cn('text-xl', 'font-black', 'tracking-tighter', 'text-slate-900', 'transition-colors', 'duration-300', 'group-hover:text-blue-900')}>4.8</span>
            <span className={cn('text-xs', 'font-bold', 'uppercase', 'tracking-widest', 'text-slate-500', 'transition-colors', 'duration-300', 'group-hover:text-blue-700')}>Rated On Trustpilot</span>
          </div>

          {/* Travelers Pill */}
          <div className={cn('group', 'flex', 'cursor-default', 'items-center', 'gap-2.5', 'rounded-full', 'border', 'border-blue-300', 'px-5', 'py-2.5', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'shadow-[0_8px_20px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.6)]', 'transition-all', 'duration-500', 'ease-[cubic-bezier(0.23,1,0.32,1)]', 'hover:-translate-y-0.5', 'hover:scale-[1.015]', 'hover:bg-white/20', 'hover:shadow-[0_12px_24px_rgba(37,99,235,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)]')}>
            <span className={cn('text-xl', 'font-black', 'tracking-tighter', 'text-slate-900', 'transition-colors', 'duration-300', 'group-hover:text-blue-900')}>250K+</span>
            <span className={cn('text-xs', 'font-bold', 'uppercase', 'tracking-widest', 'text-slate-500', 'transition-colors', 'duration-300', 'group-hover:text-blue-700')}>Happy Travelers</span>
          </div>

          {/* Airlines Pill */}
          <div className={cn('group', 'flex', 'cursor-default', 'items-center', 'gap-2.5', 'rounded-full', 'border', 'border-white/40', 'bg-white/10', 'px-5', 'py-2.5', 'backdrop-blur-3xl', 'backdrop-saturate-200', 'shadow-[0_8px_20px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.6)]', 'transition-all', 'duration-500', 'ease-[cubic-bezier(0.23,1,0.32,1)]', 'hover:-translate-y-0.5', 'hover:scale-[1.015]', 'hover:bg-white/20', 'hover:shadow-[0_12px_24px_rgba(37,99,235,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)]')}>
            <span className={cn('text-xl', 'font-black', 'tracking-tighter', 'text-slate-900', 'transition-colors', 'duration-300', 'group-hover:text-blue-900')}>450+</span>
            <span className={cn('text-xs', 'font-bold', 'uppercase', 'tracking-widest', 'text-slate-500', 'transition-colors', 'duration-300', 'group-hover:text-blue-700')}>Airlines</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
