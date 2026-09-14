"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shop/mainPage/navbarItems/Navbar";
import Footer from "@/components/shop/mainPage/Footer";
import PromoStrip from "@/components/shop/mainPage/PromoStrip";
import SalePopup from "@/components/shop/mainPage/SalePopup";
import type { HomeCategoryTile } from "@/types/category.type";

/**
 * `footerCategories` app/layout.tsx (Server Component) se aati hain. Footer
 * khud client component hai, is liye wo khud fetch nahi kar sakta — aur
 * useEffect se fetch karna SEO ke liye bekaar hota (links server HTML mein
 * nahi jate, jabke unka maqsad hi yehi hai).
 */
const AppShell = ({
  children,
  footerCategories,
}: {
  children: React.ReactNode;
  footerCategories?: HomeCategoryTile[];
}) => {
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
      <Footer categories={footerCategories} />
      <SalePopup />
    </>
  );
};

export default AppShell;
