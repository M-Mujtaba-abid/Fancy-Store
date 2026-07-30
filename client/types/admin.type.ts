// types/admin.type.ts

export interface DashboardStatsData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
}

export interface DashboardStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DashboardStatsData;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatar: string | null;
}

export interface AdminUsersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: AdminUser[];
}

export interface ChatRoom {
  id: string;
  userId: number | null;
  guestId: string | null;
  userType: "guest" | "registered";
  status: "active" | "closed" | "archived";
  lastMessage: string | null;
  lastMessageAt: string;
  unreadAdminCount: number;
  unreadUserCount: number;
  user?: { id: number; name: string; email: string } | null;
}

export interface ChatRoomsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ChatRoom[];
}