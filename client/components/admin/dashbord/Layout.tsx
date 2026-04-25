"use client";

import React, { useState } from "react";
import MainWindow from "./MainWindow";
import Sidebar from "./Sidebar";
import { AdminDashboardSection } from "@/types/product.type";

const Layout = () => {
  const [activeSection, setActiveSection] = useState<AdminDashboardSection>("products-add");

  return (
    <div className="flex min-h-screen bg-background text-text-main">
      <Sidebar activeSection={activeSection} onChangeSection={setActiveSection} />
      <MainWindow activeSection={activeSection} />
    </div>
  );
};

export default Layout;
