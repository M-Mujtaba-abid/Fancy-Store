"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shop/mainPage/navbarItems/Navbar";
import Footer from "@/components/shop/mainPage/Footer";

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
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
};

export default AppShell;
