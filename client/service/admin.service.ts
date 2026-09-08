// service/adminService/admin.service.ts

import { AdminUsersResponse, ChatRoomsResponse, DashboardStatsResponse, DashboardProfitSummary, SalesChartPoint, LowStockProduct } from "@/types/admin.type";
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

  getProfitSummary: async (): Promise<{ data: DashboardProfitSummary }> => {
    const response = await api.get("/admin/dashboard/profit-summary");
    return response.data;
  },

  getSalesChart: async (): Promise<{ data: SalesChartPoint[] }> => {
    const response = await api.get("/admin/dashboard/sales-chart", { params: { period: "30days" } });
    return response.data;
  },

  getLowStockProducts: async (): Promise<{ data: LowStockProduct[] }> => {
    const response = await api.get("/admin/dashboard/low-stock");
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUsersResponse> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  getChatRooms: async (): Promise<ChatRoomsResponse> => {
    const response = await api.get("/admin/chat/rooms");
    return response.data;
  },

  deleteChatRoom: async (roomId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/chat/rooms/${roomId}`);
    return response.data;
  },
};