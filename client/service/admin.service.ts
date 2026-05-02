// service/adminService/admin.service.ts

import { DashboardStatsResponse } from "@/types/admin.type";
import api from "./api";

// import api from "../api"; // Apne axios instance ka sahi path check kar lein
// import { DashboardStatsResponse } from "@/types/admin.type";

export const adminService = {
  // ✅ Dashboard stats fetch karne ka function
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    // URL wahi hai jo aapne backend mein set kiya hai
    const response = await api.get("/admin/dashboard-stats");
    return response.data;
  },
};