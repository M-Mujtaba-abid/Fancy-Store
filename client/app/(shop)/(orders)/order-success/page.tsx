"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-card p-8 md:p-12 rounded-3xl shadow-lg border border-border/50 text-center max-w-lg w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={60} className="text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-text-main mb-2">Order Confirmed!</h1>
        <p className="text-text-muted mb-6">
          Thank you for shopping with us. Your order has been successfully placed.
        </p>

        {orderId && (
          <div className="bg-background p-4 rounded-xl border border-border mb-8">
            <p className="text-sm text-text-muted mb-1">Order Tracking ID:</p>
            <p className="text-lg font-bold tracking-wider text-primary">#{orderId.substring(0, 8).toUpperCase()}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center  gap-4 justify-center">
          <Link href="/order" className="px-6 p-6  bg-primary text-center text-white font-bold rounded-xl hover:opacity-90 transition-all flex-1">
            View Order
          </Link>
          <Link href="/products" className="px-6 p-6 bg-background border border-border font-bold rounded-xl hover:bg-card transition-all flex-1 text-primary flex items-center justify-center gap-2">
            <ShoppingBag size={18} /> Continue 
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Next.js mein useSearchParams use karne ke liye Suspense boundary zaroori hai
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}