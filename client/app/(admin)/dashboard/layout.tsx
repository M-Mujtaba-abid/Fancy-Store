"use client";

import React from "react";
import { useGetProfile } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SidebarNav from "./_components/SidebarNav";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: profile, isLoading, error } = useGetProfile();
  const isAdmin = profile?.data?.role === "admin";
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = React.useCallback(() => setSidebarOpen(false), []);

  // Auth Guard Logic
  React.useEffect(() => {
    if (!isLoading && (error || !profile)) router.replace("/login");
    if (!isLoading && profile && !isAdmin) router.replace("/");
  }, [profile, isLoading, error, isAdmin, router]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (!isAdmin) return null;

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
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
