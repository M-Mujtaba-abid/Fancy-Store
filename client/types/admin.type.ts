// types/admin.type.ts

export interface DashboardStatsData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
}

export interface DashboardStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DashboardStatsData;
}