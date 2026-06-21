"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MoreVertical } from "lucide-react";
import SearchBar from "./SearchBar";
import { useTheme } from "next-themes";
import LoginSync from "@/components/LoginSync";
import NavCartButton from "./NavCartButton";

// ✅ Apna naya component import karein
import NavbarModal from "./NavbarModal"; 
import MobileBottomNav from "./MobileBottomNav";

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
  { name: "Shop All", href: "/products" },
  { name: "New Arrivals", href: "/viewMore?filter=new-arrivals" },
  { name: "Best Sellers", href: "/viewMore?filter=featured" },   // "Featured" ki jagah
  { name: "Deals", href: "/viewMore?filter=on-sale" },           // "Sales" ki jagah
  { name: "Contact Us", href: "/contactus" },
];

  return (
    <nav className="fixed top-0 z-50 w-full bg-background transition-colors duration-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          <LoginSync />

          {/* 1. Logo Section */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src={logoSrc}
                alt="Logo"
                width={140}
                height={60}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex space-x-10 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-text-main hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* 3. Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="p-2 text-text-main hover:text-primary"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>

            <NavCartButton />

            {/* 3-Dots Menu & Dropdown Modal */}
            <div className="relative" ref={menuRef} 
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button
              
                onClick={() => setIsMenuOpen(!isMenuOpen)}

                className={`p-2 rounded-full transition-all ${isMenuOpen ? "bg-card text-primary" : "text-text-main hover:bg-card"}`}
              >
                <MoreVertical size={22} strokeWidth={1.5} />
              </button>

              {/* ✅ Yahan sirf apna component call kar diya! */}
              {isMenuOpen && (
                <NavbarModal 
                  navLinks={navLinks} 
                  closeMenu={() => setIsMenuOpen(false)} 
                />
              )}
            </div>
          </div>

          <SearchBar
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        </div>
      </div>
      <MobileBottomNav />
    </nav>
  );
};

export default Navbar;