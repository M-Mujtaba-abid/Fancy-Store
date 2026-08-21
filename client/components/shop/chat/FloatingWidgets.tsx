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
    <>
      <LiveChat />
      <WhatsAppWidget />
      <ChatWidget />
    </>
  );
}
