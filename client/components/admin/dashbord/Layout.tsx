"use client";

import React, { useState } from "react";
import MainWindow from "./MainWindow";
import Sidebar from "./Sidebar";
import { AdminDashboardSection } from "@/types/product.type";

const Layout = () => {
  const [activeSection, setActiveSection] = useState<AdminDashboardSection>("products-add");

  return (
    <div className="absolute top-0 left-0 w-full flex h-screen bg-background text-text-main overflow-hidden">
      <Sidebar activeSection={activeSection} onChangeSection={setActiveSection} />
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <MainWindow activeSection={activeSection} />
      </div>
    </div>
  );
};

export default Layout;
