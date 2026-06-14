"use client";

import React from "react";
import { useGetProfile } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SidebarNav from "./_components/SidebarNav";
import { Menu } from "lucide-react";
import { isAuthenticated, getUserRole } from "@/utils/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: profile, isLoading } = useGetProfile();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = React.useCallback(() => setSidebarOpen(false), []);

  // 🔐 Auth guard: check localStorage FIRST (synchronous, no API call)
  // This is reliable even when cross-origin profile requests fail on production
  React.useEffect(() => {
    const loggedIn = isAuthenticated();
    const role = getUserRole();

    if (!loggedIn) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/");
      return;
    }

    // Optional: If profile loaded and shows non-admin, redirect
    if (profile && profile.data?.role !== "admin") {
      router.replace("/");
    }
  }, [profile, router]);

  // Show loading only while checking localStorage (instant)
  if (!isAuthenticated() || getUserRole() !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="absolute top-0 flex w-full h-screen bg-background text-text-main overflow-hidden">
      <SidebarNav isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <header className="sticky top-0 z-20 lg:hidden border-b border-border/50 bg-background/95 backdrop-blur px-4 py-3">
          <button
            type="button"
            aria-label="Open admin sidebar"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-card border border-border/50 px-3 py-2 text-sm font-semibold"
          >
            <Menu size={18} />
            Menu
          </button>
        </header>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
