import api from "./api"; // Aapka Axios instance jisme withCredentials: true hai
import { CartResponse, AddToCartPayload } from "@/types/cart.type";

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const res = await api.get("/cart");
    return res.data;
  },

  addToCart: async (data: AddToCartPayload) => {
    const res = await api.post("/cart/add", data);
    return res.data;
  },

  updateCartItem: async (data: AddToCartPayload) => {
    const res = await api.patch("/cart/update", data);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.get("/cart/clear"); // Backend pe aapne GET banaya hai clear ke liye
    return res.data;
  },
};