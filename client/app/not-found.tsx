"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-background px-4 py-12 transition-colors duration-300 dark:bg-slate-950 sm:py-16">
      <div className="w-full max-w-lg text-center">
        {/* Minimalist 404 with Red Animation */}
        <div className="relative mx-auto flex min-h-36 items-center justify-center sm:min-h-56">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="select-none text-[clamp(6rem,28vw,12.5rem)] font-black leading-none text-border-custom/40 dark:text-slate-700"
          >
            404
          </motion.h1>

          {/* Pulsing Red Indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-error px-4 py-2 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] sm:px-6"
          >
            <span className="text-sm font-black uppercase tracking-widest">
              Lost in Space
            </span>
          </motion.div>
        </div>

        {/* Short English Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <h2 className="text-xl md:text-2xl font-bold text-text-main dark:text-white uppercase tracking-tight">
            Page Not Found
          </h2>
          <p className="text-text-muted dark:text-slate-400 mt-2 text-sm max-w-xs mx-auto font-medium">
            The link is broken or the page has been moved.
          </p>
        </motion.div>

        {/* Minimal Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
        >
          <Link
            href="/"
            className="flex min-h-11 w-full items-center justify-center rounded-full bg-error px-10 py-3.5 font-bold text-white shadow-lg shadow-error/20 transition-all hover:bg-error/90 active:scale-95 dark:shadow-error/10 sm:w-auto"
          >
            <Home size={18} className="mr-2" />
            Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex min-h-11 w-full items-center justify-center rounded-full border border-border-custom px-10 py-3.5 font-bold text-text-main transition-all hover:border-error hover:bg-error hover:text-white active:scale-95 dark:border-slate-600 dark:text-white dark:hover:border-error sm:w-auto"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
