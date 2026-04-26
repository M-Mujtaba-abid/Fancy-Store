"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForgetPassword, useVerifyOtp, useResetPassword } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { Mail, KeyRound, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function ForgetPasswordPage() {
  const router = useRouter();
  
  // States
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Mutations
  const { mutate: sendOtp, isPending: isSending } = useForgetPassword();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  // --- Handlers ---
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendOtp({ email }, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        setStep(2); // OTP wale step par jao
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp({ email, otp }, {
      onSuccess: () => {
        toast.success("OTP verified!");
        setStep(3); // New Password wale step par jao
      }
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword({ email, newPassword }, {
      onSuccess: () => {
        toast.success("Password reset successfully!");
        router.push("/login"); // Login page par bhej do
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-lg border border-border/50">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-text-main">
            {step === 1 && "Forget Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {step === 1 && "Enter your email to receive a 6-digit code."}
            {step === 2 && `We sent a code to ${email}`}
            {step === 3 && "Enter your new strong password."}
          </p>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Enter your email address"
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 flex justify-center items-center rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-70 transition-all font-bold"
            >
              {isSending ? <Loader2 className="animate-spin" size={20} /> : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all tracking-widest text-lg font-bold text-center"
                placeholder="------"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || otp.length < 6}
              className="w-full py-3 px-4 flex justify-center items-center rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-70 transition-all font-bold"
            >
              {isVerifying ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-primary hover:underline text-center">
              Change Email
            </button>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={isResetting}
              className="w-full py-3 px-4 flex justify-center items-center rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-70 transition-all font-bold"
            >
              {isResetting ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}