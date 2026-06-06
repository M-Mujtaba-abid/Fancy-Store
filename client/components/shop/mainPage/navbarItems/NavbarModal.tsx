"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, User, Heart, Package } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import AuthButtons from "../../share/AuthButtons";

interface NavbarModalProps {
  navLinks: { name: string; href: string }[];
  closeMenu: () => void;
}

const NavbarModal: React.FC<NavbarModalProps> = ({ navLinks, closeMenu }) => {
  return (
    <div className="absolute right-0 pt-3 w-64 origin-top-right bg-background shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-50 ">
      <div className="py-2 bg-background text-text-main">
        
        {/* ========================================== */}
        {/* 📱 MOBILE NAVIGATION (Sirf Mobile Pe Dikhega) */}
        {/* ========================================== */}
        <div className="md:hidden pb-2 mb-2 border-b border-border/50">
          <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Navigation
          </p>

          {/* ✅ 'Shop All' aur 'Sales' Bottom Nav mein hain, isliye unko yahan se filter/hide kar diya taake duplicate na hon */}
          {navLinks
            .filter((link) => link.name !== "Shop All" && link.name !== "Sales")
            .map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-background/80"
              >
                {link.name} <ChevronRight size={14} className="text-text-muted" />
              </Link>
          ))}
        </div>

        {/* ========================================== */}
        {/* 💻 ACCOUNT & SETTINGS (Sirf Desktop Pe Dikhega) */}
        {/* ========================================== */}
        <div className="pb-2 mb-2 border-b border-border/50">
          <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Account & Settings
          </p>
          
          <Link
            href="/profile"
            onClick={closeMenu}
            className="flex items-center px-4 py-3 text-sm hover:bg-border/50 transition-colors"
          >
            <User className="mr-3 text-text-muted" size={18} /> Profile
          </Link>
          
          <Link
            href="/wishlist"
            onClick={closeMenu}
            className="flex items-center px-4 py-3 text-sm hover:bg-border/50 transition-colors"
          >
            <Heart className="mr-3 text-text-muted" size={18} /> Wishlist
          </Link>
          
          <Link
            href="/order"
            onClick={closeMenu}
            className="flex items-center px-4 py-3 text-sm hover:bg-border/50 transition-colors"
          >
            <Package className="mr-3 text-text-muted" size={18} /> My Orders
          </Link>
        </div>

        {/* ========================================== */}
        {/* 🌗 THEME & AUTH (Mobile aur Desktop Dono Pe Dikhega) */}
        {/* ========================================== */}
        <div className="hover:bg-background/80 transition-colors">
          <ThemeToggle />
        </div>

        <div className=" ">
           <AuthButtons className="flex flex-col" />
        </div>

      </div>
    </div>
  );
};

export default NavbarModal;