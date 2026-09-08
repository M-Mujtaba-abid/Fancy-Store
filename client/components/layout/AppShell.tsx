"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shop/mainPage/navbarItems/Navbar";
import Footer from "@/components/shop/mainPage/Footer";
import PromoStrip from "@/components/shop/mainPage/PromoStrip";
import SalePopup from "@/components/shop/mainPage/SalePopup";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/forget-password");

  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <PromoStrip />
      {/* PromoStrip fixed hai, is liye content ko uski height jitna neeche
          dhakelna parta hai. Height PromoStrip se match rakhein (h-10 sm:h-12). */}
      <div aria-hidden="true" className="h-10 sm:h-12" />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <SalePopup />
    </>
  );
};

export default AppShell;
