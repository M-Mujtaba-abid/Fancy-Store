"use client";

import React from "react";
import { usePathname } from "next/navigation";
import LiveChat from "@/components/LiveChat";
import WhatsAppWidget from "@/components/shop/chat/WhatsAppWidget";
import ChatWidget from "@/components/shop/chat/DynamicChatWidget";

export default function FloatingWidgets() {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-3 z-50 flex flex-col items-center gap-2 md:bottom-6 md:right-6">
      <LiveChat />
      <WhatsAppWidget />
      <ChatWidget />
    </div>
  );
}
