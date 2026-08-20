"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const WhatsAppWidget = () => {
  const pathname = usePathname();

  // ✅ Apna WhatsApp Number yahan likhein (Country code 92 ke sath, bina + lagaye)
  const phoneNumber = "923414159747";

  // ✅ Default message jo user ki taraf se type hua aayega
  const message = "Hi Fancy Store! I need some details about car covers.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const isAdminRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminRoute) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform duration-300 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </Link>
    </div>
  );
};

export default WhatsAppWidget;