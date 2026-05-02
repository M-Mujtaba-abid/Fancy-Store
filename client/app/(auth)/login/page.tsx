// app/login/page.tsx (Ya aapka jo bhi path hai)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLogin } from "@/hooks/useAuth";
import { Loader, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import GoogleAuth from "@/components/shop/share/GoogleAuth";


export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-text-main transition-colors duration-300 perspective-1000 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute  left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT SECTION - Brand / Logo */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative z-10 min-h-[30vh] lg:min-h-screen">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <Image
              src={logoSrc}
              alt="Fancy Store"
              width={500}
              height={200}
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-xl lg:text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-text-muted text-xs uppercase tracking-[0.3em] font-medium">
            Please Login 
          </p>
        </div>
      </div>

      {/* RIGHT SECTION - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center  lg:p-12 relative z-10 pb-12 lg:pb-0">
        <div className="max-w-md w-full space-y-8">
          {/* 3D Card Container */}
          <div className="group relative">
            {/* Decorative Border Glow for 3D depth */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/50 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

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
                    <Link
                      href="/forget-password"
                      className="text-[10px] uppercase font-bold text-primary hover:tracking-widest transition-all"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within/input:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-inner"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary transition-colors"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-custom/40 opacity-50"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span className="bg-card px-4 text-text-muted">Or Social Entry</span>
                </div>
              </div>

              {/* Social Logins Component */}
              <GoogleAuth />
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center text-xs text-text-muted font-medium animate-in fade-in duration-1000 delay-300">
            NEW TO THE STORE?{" "}
            <Link href="/signup" className="text-primary font-black hover:underline underline-offset-4 ml-1 transition-all">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-2:hover { transform: rotateX(4deg) rotateY(-2deg); }
      `}</style>
    </div>
  );
}