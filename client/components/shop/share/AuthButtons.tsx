"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ useSearchParams add kiya
import { authService } from "@/service/authService/auth.service";
import toast from "react-hot-toast";
import Link from "next/link";
// ✅ Icons import kiye hain
import { LogIn, UserPlus, LogOut } from "lucide-react";

interface AuthButtonsProps {
  className?: string; 
}

function AuthButtonsContent({ className }: { className: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginStatus = searchParams.get("login");
      if (loginStatus === "success") {
        localStorage.setItem("isLoggedIn", "true");
        toast.success("Logged in successfully!");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const loggedInFlag = localStorage.getItem("isLoggedIn");    
      if (loggedInFlag === "true") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
    
    setIsLoading(false); 
  }, [searchParams]);

  const handleLogout = async () => {
   try {
      await authService.logout();
      
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

  if (isLoading) {
    return <div className="h-10 w-full animate-pulse bg-background/50 rounded-lg ml-4 max-w-[150px]"></div>;
  }

  return (
    <div className={className}>
      {isLoggedIn ? (
        // ✅ LOGOUT BUTTON
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-500 transition-colors text-left"
        >
          <LogOut className="mr-3 text-text-muted hover:text-red-500 transition-colors" size={18} />
          Logout
        </button>
      ) : (
        <>
          {/* ✅ LOGIN LINK */}
          <Link
            href="/login"
            className="flex items-center px-4 py-3 text-sm hover:bg-border-custom transition-colors"
          >
            <LogIn className="mr-3 text-text-muted" size={18} />
            Login
          </Link>
          
          {/* ✅ SIGN UP LINK */}
          <Link
            href="/signup" 
            className="flex items-center px-4 py-3 text-sm hover:bg-border-custom transition-colors"
          >
            <UserPlus className="mr-3 text-text-muted" size={18} />
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}

export default function AuthButtons({ className = "" }: AuthButtonsProps) {
  return (
    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-background/50 rounded-lg"></div>}>
      <AuthButtonsContent className={className} />
    </Suspense>
  );
}