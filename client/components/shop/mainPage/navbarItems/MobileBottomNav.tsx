"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, Heart, User, LogIn } from "lucide-react";
import { isAuthenticated } from "@/utils/auth";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const loggedIn = isAuthenticated();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/products", icon: Store },
    { name: "Search", href: null, icon: Search },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    {
      name: loggedIn ? "Profile" : "Login",
      href: loggedIn ? "/profile" : "/login",
      icon: loggedIn ? User : LogIn,
    },
  ];

  return (
    <div className="block md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-900/90 backdrop-blur-md text-white rounded-full px-6 py-3 shadow-2xl flex items-center justify-between z-50 border border-zinc-800 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href
            ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            : false;
          const itemClassName = `p-2 rounded-full hover:bg-zinc-800 transition-colors ${isActive ? "bg-zinc-700/80" : ""}`;

          if (!item.href) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-search"))}
                className={itemClassName}
                aria-label="Search products"
              >
                <Icon size={22} strokeWidth={1.8} />
              </button>
            );
          }

          return (
            <Link key={item.name} href={item.href} className={itemClassName} aria-label={item.name}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            </Link>
          );
        })}
    </div>
  );
};

export default MobileBottomNav;