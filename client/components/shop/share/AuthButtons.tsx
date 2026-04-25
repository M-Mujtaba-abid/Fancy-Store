"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/service/auth.service";
import toast from "react-hot-toast";
import Link from "next/link";

interface AuthButtonsProps {
  className?: string; 
}

// 📌 Helper function: Cookie read karne ke liye
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function AuthButtons({ className = "flex gap-3" }: AuthButtonsProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check User is Logged In or Not (via Cookie)
  useEffect(() => {
    // ⚠️ Dhyan rakhein: Yahan 'token' ki jagah wahi naam likhein jo backend cookie ka naam rakhta hai (jaise 'jwt', 'session', ya 'token')
const loggedInFlag = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;    
    if (loggedInFlag) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    
    setIsLoading(false); 
  }, []);

  // 2. Logout Logic
  const handleLogout = async () => {
   try {
      await authService.logout();
      
      // ✅ Logout par localStorage se flag remove kar dein
      if (typeof window !== "undefined") {
        localStorage.removeItem("isLoggedIn"); 
      }
      setIsLoggedIn(false);
      
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  // 3. Loading UI 
  if (isLoading) {
    return <div className="h-10 w-24 animate-pulse bg-background/50 rounded-lg"></div>;
  }

  // 4. Final Render UI
  return (
    <div className={className}>
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-lg bg-error text-white font-semibold hover:opacity-90 transition-opacity w-full md:w-auto"
        >
          Logout
        </button>
      ) : (
        <>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-lg bg-background border border-border-custom text-text-main font-semibold hover:bg-card transition-colors text-center w-full md:w-auto"
          >
            Login
          </Link>
          <Link
            href="/register" 
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity text-center w-full md:w-auto"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}