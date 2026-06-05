// // import api from "./api"; // Aapka Axios instance jisme withCredentials: true hai
// import { CartResponse, AddToCartPayload } from "@/types/cart.type";
// import api from "../api";

// export const cartService = {
//   getCart: async (): Promise<CartResponse> => {
//     const res = await api.get("/cart");
//     return res.data;
//   },

//   addToCart: async (data: AddToCartPayload) => {
//     const res = await api.post("/cart/add", data);
//     return res.data;
//   },

//   updateCartItem: async (data: AddToCartPayload) => {
//     const res = await api.patch("/cart/update", data);
//     return res.data;
//   },

//   clearCart: async () => {
//     const res = await api.get("/cart/clear"); // Backend pe aapne GET banaya hai clear ke liye
//     return res.data;
//   },
// };


import { CartResponse, AddToCartPayload } from "@/types/cart.type";
import api from "../api";
import { isAuthenticated } from "@/utils/auth";

const GUEST_CART_KEY = "fancy_store_guest_cart";

// ✅ Guest Cart Helper Functions (LocalStorage)
const guestCartHandler = {
  get: (): CartResponse => {
    if (typeof window === "undefined") return { items: [], subtotal: 0, success: true };
    const data = localStorage.getItem(GUEST_CART_KEY);
    return data ? JSON.parse(data) : { items: [], subtotal: 0, success: true };
  },
  save: (cart: CartResponse) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  }
};

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    if (isAuthenticated()) {
      const res = await api.get("/cart");
      return res.data;
    }
    return guestCartHandler.get();
  },

  addToCart: async (data: AddToCartPayload) => {
    if (isAuthenticated()) {
      const res = await api.post("/cart/add", { productId: data.productId, quantity: data.quantity });
      return res.data;
    }
    
    // 🛒 Guest Logic
    const cart = guestCartHandler.get();
    const existingIndex = cart.items.findIndex((i) => i.productId === data.productId);
    const itemPrice = data.price || 0;

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += data.quantity;
      cart.items[existingIndex].itemTotal = cart.items[existingIndex].quantity * itemPrice;
    } else {
      cart.items.push({
        cartItemId: `guest_${Date.now()}`,
        productId: data.productId,
        name: data.name || "Product",
        image: data.image || "",
        quantity: data.quantity,
        price: itemPrice,
        itemTotal: data.quantity * itemPrice,
        availableStock: 999,
      });
    }

    cart.subtotal = cart.items.reduce((total, item) => total + item.itemTotal, 0);
    guestCartHandler.save(cart);
    return cart;
  },

  updateCartItem: async (data: AddToCartPayload) => {
    if (isAuthenticated()) {
      const res = await api.patch("/cart/update", { productId: data.productId, quantity: data.quantity });
      return res.data;
    }

    // 🛒 Guest Logic
    const cart = guestCartHandler.get();
    if (data.quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== data.productId);
    } else {
      const item = cart.items.find((i) => i.productId === data.productId);
      if (item) {
        item.quantity = data.quantity;
        item.itemTotal = item.quantity * (item.price || data.price || 0);
      }
    }
    
    cart.subtotal = cart.items.reduce((total, item) => total + item.itemTotal, 0);
    guestCartHandler.save(cart);
    return cart;
  },

  clearCart: async () => {
    if (isAuthenticated()) {
      const res = await api.get("/cart/clear");
      return res.data;
    }
    
    // 🛒 Guest Logic
    localStorage.removeItem(GUEST_CART_KEY);
    return { items: [], subtotal: 0, success: true };
  },
};