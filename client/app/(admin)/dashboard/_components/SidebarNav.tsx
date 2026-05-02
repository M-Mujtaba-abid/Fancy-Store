"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, ChevronDown, ClipboardList, LayoutDashboard, X } from "lucide-react";
import React from "react";
import AuthButtons from "@/components/shop/share/AuthButtons";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarNav = ({ isOpen, onClose }: SidebarNavProps) => {
  const pathname = usePathname();
  const [openProducts, setOpenProducts] = React.useState(true);
  const [openOrders, setOpenOrders] = React.useState(true);

  const isActive = (path: string) => pathname === path;
  const handleLinkClick = () => onClose();

  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 w-[290px] h-screen bg-card p-5 floating-card flex flex-col border-r border-border/50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <div className="mb-6 flex items-center justify-between">
        <div>
        <h2 className="text-xl font-black text-text-main">Admin Panel</h2>
        {/* <p className="text-xs text-text-muted mt-1">Dashboard Controls</p> */}
        </div>
        <button
          type="button"
          aria-label="Close sidebar menu"
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg bg-background border border-border/50"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <Link
          href="/dashboard"
          onClick={handleLinkClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
            isActive("/dashboard") ? "bg-primary text-white" : "bg-background text-text-main hover:bg-background/80"
          }`}
        >
          <LayoutDashboard size={18} />
          Overview Stats
        </Link>

        <div className="space-y-2">
          <button
            onClick={() => setOpenProducts((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm bg-background text-text-main hover:bg-background/80"
          >
            <span className="flex items-center gap-3">
              <Box size={18} />
              Products
            </span>
            <ChevronDown size={16} className={`${openProducts ? "rotate-180" : ""} transition-transform`} />
          </button>
          {openProducts && (
            <div className="pl-4 space-y-1">
              <Link
                href="/dashboard/products"
                onClick={handleLinkClick}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                  isActive("/dashboard/products") ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Show Products
              </Link>
              <Link
                href="/dashboard/products/add"
                onClick={handleLinkClick}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                  isActive("/dashboard/products/add") ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Add Product
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setOpenOrders((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm bg-background text-text-main hover:bg-background/80"
          >
            <span className="flex items-center gap-3">
              <ClipboardList size={18} />
              Orders
            </span>
            <ChevronDown size={16} className={`${openOrders ? "rotate-180" : ""} transition-transform`} />
          </button>
          {openOrders && (
            <div className="pl-4 space-y-1">
              <Link
                href="/dashboard/orders"
                onClick={handleLinkClick}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                  isActive("/dashboard/orders") ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Show Orders
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-border/50">
        <ThemeToggle />
        <AuthButtons className="flex flex-col gap-2" />
      </div>
      </aside>
    </>
  );
};

export default SidebarNav;
