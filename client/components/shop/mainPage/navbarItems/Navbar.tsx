"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  MoreVertical,
  User,
  LogIn,
  LogOut,
  ChevronRight,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes"; // Import useTheme
// import { useState, useEffect, useRef } from "react";
const Navbar = () => {
  const { resolvedTheme } = useTheme(); // resolvedTheme "light" ya "dark" batata hai
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hydration error se bachne ke liye mounted check lazmi hai
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/logoB.png" // Dark theme ke liye image (Black bg wali)
      : "/logoW.png"; // Light theme ke liye image (White bg wali)
  // Outside click to close menu logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border-custom bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* 1. Logo Section */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center">
              {/* Replace '/logo.png' with your actual image path */}
              <Image
                src={logoSrc}
                alt="Fancy Store Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* 2. Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex space-x-10 items-center">
            <Link
              href="/shop"
              className="text-sm font-medium text-text-main hover:text-primary transition-colors"
            >
              Shop All
            </Link>
            <Link
              href="/new"
              className="text-sm font-medium text-text-main hover:text-primary transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/collections"
              className="text-sm font-medium text-text-main hover:text-primary transition-colors"
            >
              Collections
            </Link>
          </div>

          {/* 3. Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Search - Hidden on very small mobile if needed, but usually kept */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-text-main hover:text-primary transition-all"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-text-main hover:text-primary transition-all"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 bg-primary text-[10px] text-white font-bold h-4 w-4 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>

            {/* 3-Dots Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full transition-all ${isMenuOpen ? "bg-border-custom text-primary" : "text-text-main hover:bg-border-custom"}`}
              >
                <MoreVertical size={22} strokeWidth={1.5} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 origin-top-right bg-background border border-border-custom shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="py-2">
                    {/* Mobile Only Links (Visible only on small screens inside 3-dots) */}
                    <div className="md:hidden border-b border-border-custom pb-2 mb-2">
                      <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Navigation
                      </p>
                      <Link
                        href="/shop"
                        className="flex items-center justify-between px-4 py-3 text-sm text-text-main hover:bg-border-custom"
                      >
                        Shop All <ChevronRight size={14} />
                      </Link>
                      <Link
                        href="/new"
                        className="flex items-center justify-between px-4 py-3 text-sm text-text-main hover:bg-border-custom"
                      >
                        New Arrivals <ChevronRight size={14} />
                      </Link>
                    </div>

                    <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      Account & Settings
                    </p>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 text-sm text-text-main hover:bg-border-custom transition-colors"
                    >
                      <User className="mr-3 text-text-muted" size={18} />{" "}
                      Profile
                    </Link>

                    <ThemeToggle />

                    <div className="mt-2 pt-2 border-t border-border-custom">
                      <Link
                        href="/auth"
                        className="flex items-center px-4 py-3 text-sm text-text-main hover:bg-border-custom transition-colors"
                      >
                        <LogIn className="mr-3 text-text-muted" size={18} />{" "}
                        Sign In / Register
                      </Link>
                      <button className="w-full flex items-center px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors">
                        <LogOut className="mr-3" size={18} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <SearchBar
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
