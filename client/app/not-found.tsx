"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-background px-4">
      <div className="text-center">
        
        {/* Minimalist 404 with Red Animation */}
        <div className="relative inline-block">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[120px] md:text-[200px] font-black text-border-custom/40 leading-none select-none"
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
              ease: "easeInOut" 
            }}
            className="absolute bottum-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-error text-white px-6 py-2 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            <span className="text-sm font-black uppercase tracking-widest">Lost in Space</span>
          </motion.div>
        </div>

        {/* Short English Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <h2 className="text-xl md:text-2xl font-bold text-text-main uppercase tracking-tight">
            Page Not Found
          </h2>
          <p className="text-text-muted mt-2 text-sm max-w-xs mx-auto font-medium">
            The link is broken or the page has been moved.
          </p>
        </motion.div>

        {/* Minimal Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/"
            className="flex items-center justify-center w-full sm:w-auto px-10 py-4 bg-error text-white rounded-full font-bold transition-all hover:bg-error/90 active:scale-95 shadow-lg shadow-error/20"
          >
            <Home size={18} className="mr-2" />
            Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-full sm:w-auto px-10 py-4 border border-border-custom text-text-main rounded-full font-bold hover:bg-error hover:text-white hover:border-error transition-all active:scale-95"
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