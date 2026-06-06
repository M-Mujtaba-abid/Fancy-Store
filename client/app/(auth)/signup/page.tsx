// app/signup/page.tsx (Ya aapka jo bhi path hai)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRegister } from "@/hooks/useAuth";
import {
  Loader,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import GoogleAuth from "@/components/shop/share/GoogleAuth";
import {
  trackCompleteRegistration,
  identifyTikTokUser,
} from "@/utils/tiktokTracking"; // 🎯 TIKTOK IMPORT
// import GoogleAuth from "@/components/auth/GoogleAuth"; // Apna path verify kar lein

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();
  const { resolvedTheme } = useTheme();

  const logoSrc = resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    register(formData, {
      onSuccess: (response: any) => {
        // 🎯 TIKTOK CONTENT CODE: Registration completed
        trackCompleteRegistration({
          userId: response.user?.id,
          email: response.user?.email,
        });

        // 🎯 TIKTOK CONTENT CODE: User identified after signup
        identifyTikTokUser({
          email: formData.email,
          externalId: response.user?.id,
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-text-main transition-colors duration-300 perspective-1000 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT SECTION - Brand / Logo */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative z-10 min-h-[30vh] lg:min-h-screen">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link
            href="/"
            className="inline-block mb-4 hover:scale-105 transition-transform"
          >
            <Image
              src={logoSrc}
              alt="Fancy Store"
              width={500}
              height={200}
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-xl lg:text-3xl font-bold mb-2">
            Join The Community
          </h1>
          <p className="text-text-muted text-xs uppercase tracking-[0.3em] font-medium">
            Create Your Account
          </p>
        </div>
      </div>

      {/* RIGHT SECTION - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10 pb-12 lg:pb-0">
        <div className="max-w-md w-full space-y-8">
          {/* 3D Card Container */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/50 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            <div className="relative bg-card p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all duration-500 hover:rotate-x-2 hover:rotate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] floating-card">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
                    Full Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within/input:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-inner"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

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
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
                    Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within/input:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-inner"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
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

                <button
                  disabled={isPending}
                  className="group/btn w-full bg-primary text-white font-black py-4 rounded-xl flex justify-center items-center gap-3 transition-all mt-2 hover:shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] active:scale-95 disabled:opacity-70 relative overflow-hidden"
                >
                  <span className="relative z-10 tracking-widest text-xs">
                    CREATE ACCOUNT
                  </span>
                  {isPending ? (
                    <Loader className="animate-spin w-5 h-5 relative z-10" />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="relative z-10 group-hover:translate-x-1 transition-transform"
                    />
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
                  <span className="bg-card px-4 text-text-muted">
                    Or Social Entry
                  </span>
                </div>
              </div>

              {/* Social Logins Component */}
              <GoogleAuth />
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center mb-4 text-xs text-text-muted font-medium animate-in fade-in duration-1000 delay-300">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link
              href="/login"
              className="text-primary font-black hover:underline underline-offset-4 ml-1  transition-all"
            >
              LOG IN
            </Link>
          </p>
        </div>
      </div>

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
