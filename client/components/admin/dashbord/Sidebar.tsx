"use client";

import React from "react";
import { AdminDashboardSection } from "@/types/product.type";
import { Box, ChevronDown, ClipboardList, Settings, Users } from "lucide-react";
import AuthButtons from "@/components/shop/share/AuthButtons";

interface SidebarProps {
  activeSection: AdminDashboardSection;
  onChangeSection: (section: AdminDashboardSection) => void;
}

const Sidebar = ({ activeSection, onChangeSection }: SidebarProps) => {
  const [openProducts, setOpenProducts] = React.useState(true);
  const [openOrders, setOpenOrders] = React.useState(false);
  const [openSettings, setOpenSettings] = React.useState(false);

  return (
    <aside className="w-[290px] bg-card min-h-screen p-5 floating-card">
      <div className="mb-8">
        <h2 className="text-xl font-black text-text-main">Admin Panel</h2>
        <p className="text-xs text-text-muted mt-1">Dashboard Controls</p>
      </div>

      <nav className="space-y-3">
        <div className="space-y-2">
          <button
            onClick={() => setOpenProducts((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm bg-background text-text-main hover:bg-background/80"
          >
            <span className="flex items-center gap-3">
              <Box size={18} />
              Product Management
            </span>
            <ChevronDown size={16} className={`${openProducts ? "rotate-180" : ""} transition-transform`} />
          </button>
          {openProducts && (
            <div className="pl-4 space-y-1">
              <button
                onClick={() => onChangeSection("products-add")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  activeSection === "products-add" ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Add Products
              </button>
              <button
                onClick={() => onChangeSection("products-show")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  activeSection === "products-show" ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Show Products
              </button>
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
              Order Management
            </span>
            <ChevronDown size={16} className={`${openOrders ? "rotate-180" : ""} transition-transform`} />
          </button>
          {openOrders && (
            <div className="pl-4 space-y-1">
              <button
                onClick={() => onChangeSection("orders-add")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  activeSection === "orders-add" ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Add Orders
              </button>
              <button
                onClick={() => onChangeSection("orders-show")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  activeSection === "orders-show" ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Show Orders
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onChangeSection("users")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
            activeSection === "users" ? "bg-primary text-white" : "bg-background text-text-main hover:bg-background/80"
          }`}
        >
          <Users size={18} />
          User Management
        </button>

        <div className="space-y-2">
          <button
            onClick={() => setOpenSettings((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm bg-background text-text-main hover:bg-background/80"
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Settings
            </span>
            <ChevronDown size={16} className={`${openSettings ? "rotate-180" : ""} transition-transform`} />
          </button>
        {openSettings && (
            <div className="pl-4 space-y-1">
              <button
                onClick={() => onChangeSection("settings-theme")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  activeSection === "settings-theme" ? "bg-primary text-white" : "text-text-main hover:bg-background"
                }`}
              >
                Theme Button
              </button>
              
              {/* ✅ 2. Yahan AuthButtons lagaya gaya hai Settings ke andar */}
              <div className="pt-2 mt-2 border-t border-border-custom/30 pr-3">
                <AuthButtons className="flex flex-col gap-2" />
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
