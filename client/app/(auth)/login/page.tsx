"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLogin } from "@/hooks/useAuth";
import { Loader, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { mutate: login, isPending } = useLogin();
  const { resolvedTheme } = useTheme();

  const logoSrc = resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }
    login(formData);
  };

  const handleGoogleLogin = () => {
  // Replace this URL with your actual backend base URL if it's different
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  window.location.href = `${BACKEND_URL}/api/user/auth/google`;
  console.log("clicked")
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-main px-4 transition-colors duration-300 perspective-1000">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <Image
              src={logoSrc}
              alt="Fancy Store"
              width={160}
              height={60}
              className="object-contain"
              priority
            />
          </Link>
          <p className="text-text-muted text-xs uppercase tracking-[0.3em] font-medium">
            Secure Access Portal
          </p>
        </div>

        {/* 3D Card Container */}
        <div className="group relative">
          {/* Decorative Border Glow for 3D depth */}
          <div className="absolute -inset-0.5 bg-linear-to-br from-primary/50 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-card p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all duration-500 hover:rotate-x-2 hover:rotate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] floating-card">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within/input:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-inner"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Password
                  </label>
                  <Link href="/forgot-password" size="sm" className="text-[10px] uppercase font-bold text-primary hover:tracking-widest transition-all">
                    Reset?
                  </Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within/input:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-inner"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 ml-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-custom text-primary focus:ring-primary bg-background accent-primary"
                />
                <label htmlFor="remember" className="text-xs text-text-muted cursor-pointer select-none font-medium">
                  Keep me logged in
                </label>
              </div>

              <button
                disabled={isPending}
                className="group/btn w-full bg-primary text-white font-black py-4 rounded-xl flex justify-center items-center gap-3 transition-all hover:shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] active:scale-95 disabled:opacity-70 relative overflow-hidden"
              >
                <span className="relative z-10 tracking-widest text-xs">SIGN IN</span>
                {isPending ? (
                  <Loader className="animate-spin w-5 h-5 relative z-10" />
                ) : (
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                )}
                {/* Button Shine effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-custom/40 opacity-50"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="bg-background px-4 text-text-muted">Or Social Entry</span>
              </div>
            </div>

            {/* Social Logins */}
            <button
            onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-background rounded-xl hover:bg-card transition-all font-bold text-text-main text-xs uppercase tracking-wider shadow-sm active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
              </svg>
              Continue Google Account
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-muted font-medium animate-in fade-in duration-1000 delay-300">
          NEW TO THE STORE?{" "}
          <Link
            href="/signup"
            className="text-primary font-black hover:underline underline-offset-4 ml-1 transition-all"
          >
            CREATE ACCOUNT
          </Link>
        </p>
      </div>

      {/* Required CSS for 3D effects (Add to global CSS or as Tailwind plugin) */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-2:hover {
          transform: rotateX(4deg) rotateY(-2deg);
        }
      `}</style>
    </div>
  );
}