import api from "./api"; // Aapka Axios instance jisme token attach hota hai
import { WishlistItem } from "@/types/wishlist.type";

export const wishlistService = {
  // Get All Wishlist Items
  getWishlist: async (): Promise<WishlistItem[]> => {
    // API ka path apne backend routes ke hisaab se theek kar lein
    const res = await api.get("/wishlist"); 
    return res.data.data;
  },

  // Toggle Wishlist
  toggleWishlist: async (productId: string) => {
    const res = await api.post("/wishlist/toggle", { productId });
    return res.data; // Yeh backend se { data: { added: true, message: "..." } } return karega
  },
};