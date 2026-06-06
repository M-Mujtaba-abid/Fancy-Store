"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Tag, Heart, Package, User, LogIn } from "lucide-react";
import { isAuthenticated } from "@/utils/auth";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const loggedIn = isAuthenticated();

  const navItems = [
    { name: "Products", href: "/products", icon: Store },
    { name: "Sale", href: "/viewMore?filter=on-sale", icon: Tag },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Orders", href: loggedIn ? "/order" : "/login", icon: Package },
    {
      name: loggedIn ? "Profile" : "Login",
      href: loggedIn ? "/profile" : "/login",
      icon: loggedIn ? User : LogIn,
    },
  ];

  return (
    // md:hidden isko sirf mobile pe dikhayega, aur fixed bottom-0 isko neeche chipka dega
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-background border-t border-border/50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[60] pb-safe">
      <div className="flex justify-around items-center h-12 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Active tab logic (Agar current page is link se match karta hai)
          const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0]) && item.href !== "/";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.5} 
                className={isActive ? "scale-110 transition-transform" : ""}
              />
              <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;