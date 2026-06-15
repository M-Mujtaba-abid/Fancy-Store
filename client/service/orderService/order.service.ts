import { Order, PlaceOrderPayload } from "@/types/order.type";
import { isAuthenticated } from "@/utils/auth";
import { getGuestCartItems } from "../cartService/cart.service";
import api from "../api";

export const orderService = {
  placeOrder: async (data: PlaceOrderPayload) => {
    const payload: PlaceOrderPayload = { ...data };

    if (!isAuthenticated() && !payload.buyNowProductId) {
      payload.guestCartItems = getGuestCartItems().map((item) => ({
        productId: String(item.productId),
        quantity: item.quantity,
      }));
    }

    const res = await api.post("/orders", payload);
    return res.data;
  },

  // Apni Type/Interface file ke mutabiq imports check kar lein
getMyOrders: async (params?: { phone?: string; orderId?: string }): Promise<Order[]> => {
  const res = await api.get("/orders", { params });
  return res.data.orders;
},

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
