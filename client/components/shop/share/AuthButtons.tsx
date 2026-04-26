"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ useSearchParams add kiya
import { authService } from "@/service/auth.service";
import toast from "react-hot-toast";
import Link from "next/link";

interface AuthButtonsProps {
  className?: string; 
}

// ✅ Asal logic humne is chote component mein daal di hai
function AuthButtonsContent({ className }: { className: string }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ URL check karne ke liye
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check User is Logged In or Not
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 🌟 GOOGLE LOGIN LOGIC: Check karein agar URL mein ?login=success hai
      const loginStatus = searchParams.get("login");
      if (loginStatus === "success") {
        localStorage.setItem("isLoggedIn", "true");
        toast.success("Logged in successfully!");
        // URL saaf kar dein taake page refresh par dobara toast na aaye
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 🌟 NORMAL LOGIN LOGIC: Jo aapka pehle se tha
      const loggedInFlag = localStorage.getItem("isLoggedIn");    
      if (loggedInFlag === "true") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
    
    setIsLoading(false); 
  }, [searchParams]); // ✅ searchParams ko dependency mein add kiya

  // 2. Logout Logic
  const handleLogout = async () => {
   try {
      await authService.logout();
      
      // Logout par localStorage se flag remove kar dein
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
            href="/signup" 
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity text-center w-full md:w-auto"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}

// ✅ MAIN COMPONENT: Isko Suspense mein wrap karna lazmi hai Next.js mein
export default function AuthButtons({ className = "flex gap-3" }: AuthButtonsProps) {
  return (
    <Suspense fallback={<div className="h-10 w-24 animate-pulse bg-background/50 rounded-lg"></div>}>
      <AuthButtonsContent className={className} />
    </Suspense>
  );
}