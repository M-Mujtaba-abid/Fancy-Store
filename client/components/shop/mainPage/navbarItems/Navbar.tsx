"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  MoreVertical,
  User,
  ChevronRight,
  Heart,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import AuthButtons from "../../share/AuthButtons";
import LoginSync from "@/components/LoginSync";
import NavCartButton from "./NavCartButton";

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Aapke exact links
  const navLinks = [
    { name: "Shop All", href: "/products" },
    { name: "New Arrivals", href: "/viewMore?filter=new-arrivals" }, // path /shop theek kiya hai
    { name: "Sales", href: "/viewMore?filter=on-sale" },
    { name: "Featured", href: "/viewMore?filter=featured" },
    { name: "Contact Us", href: "/contactus" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-background transition-colors duration-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* ✅ Yeh hamesha chalega, chahe menu band ho ya khula */}
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

            {/* <Link
              href="/cart"
              className="relative p-2 text-text-main hover:text-primary"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 bg-primary text-[10px] text-white font-bold h-4 w-4 flex items-center justify-center rounded-full">
                0
              </span>
            </Link> */}
            <NavCartButton />

            {/* 3-Dots Menu & Dropdown Modal */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full transition-all ${isMenuOpen ? "bg-card text-primary" : "text-text-main hover:bg-card"}`}
              >
                <MoreVertical size={22} strokeWidth={1.5} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 origin-top-right bg-background shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-50">
                  <div className="py-2 bg-background text-text-main">
                    {/* ✅ Mobile Links (Mapped from navLinks array) */}
                    <div className="md:hidden pb-2 mb-2 border-b border-border-custom/30">
                      <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Navigation
                      </p>

                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)} // Link click hone par menu band ho jayega
                          className="flex items-center justify-between px-4 py-3 text-sm hover:bg-background/80"
                        >
                          {link.name}{" "}
                          <ChevronRight size={14} className="text-text-muted" />
                        </Link>
                      ))}
                    </div>

                    <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      Account & Settings
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex  items-center px-4 py-3 text-sm hover:bg-border-custom transition-colors"
                    >
                      <User className="mr-3 text-text-muted" size={18} />{" "}
                      Profile
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm hover:bg-border-custom transition-colors"
                    >
                      <Heart className="mr-3 text-text-muted" size={18} />{" "}
                      Wishlist
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm hover:bg-border-custom transition-colors"
                    >
                      <User className="mr-3 text-text-muted" size={18} /> random
                    </Link>

                    <div className="hover:bg-background/80 transition-colors">
                      <ThemeToggle />
                    </div>

                    <div className="mt-2 pt-2 border-t border-border-custom/30">
                      <div className="mt-2 pt-4 pb-2 px-4 border-t border-border-custom/30">
                        <AuthButtons className="flex flex-col gap-2" />
                      </div>
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
