"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WhatsAppWidget = () => {
  const pathname = usePathname();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const handleChatState = (event: Event) => {
      setIsSupportOpen((event as CustomEvent<{ isOpen: boolean }>).detail?.isOpen ?? false);
    };

    window.addEventListener("chatwidget-state", handleChatState);
    window.addEventListener("livechat-state", handleChatState);
    return () => {
      window.removeEventListener("chatwidget-state", handleChatState);
      window.removeEventListener("livechat-state", handleChatState);
    };
  }, []);

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
  if (isSupportOpen) return null;

  return (
    <div className="fixed bottom-36 right-6 z-50 md:bottom-24">
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-full bg-green-500 p-3.5 text-white shadow-lg transition-all hover:scale-110 hover:bg-green-600 hover:shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
        >
          <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.15 1.59 5.96L.1 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.45-8.43Zm-8.44 18.3h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.98 2.9a9.82 9.82 0 0 1 2.9 6.99c0 5.45-4.43 9.89-9.88 9.89Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </Link>
    </div>
  );
};

export default WhatsAppWidget;