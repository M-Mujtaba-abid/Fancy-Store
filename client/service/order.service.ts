import api from "./api"; // Aapka withCredentials wala axios instance
import { Order, PlaceOrderPayload } from "@/types/order.type";

export const orderService = {
  // ================= USER ROUTES =================
  
  placeOrder: async (data: PlaceOrderPayload) => {
    const res = await api.post("/orders", data);
    return res.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get("/orders");
    return res.data.orders;
  },

  // ================= ADMIN ROUTES =================

  getAllOrders: async (): Promise<Order[]> => {
    const res = await api.get("/orders/all");
    return res.data.orders;
  },

  getOrdersCount: async (): Promise<number> => {
    const res = await api.get("/orders/count");
    return res.data.count;
  },

  updateOrderStatus: async ({ id, status }: { id: string; status: string }) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  },
};