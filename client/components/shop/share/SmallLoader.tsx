"use client";
import { motion } from "framer-motion";

export default function SmallLoader() {
  return (
    <div className="flex justify-center mt-6">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-border-custom border-t-primary rounded-full"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute w-2 h-2 bg-primary rounded-full"
        />
      </div>
    </div>
  );
}