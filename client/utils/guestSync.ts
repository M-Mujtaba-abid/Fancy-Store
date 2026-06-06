import api from "@/service/api";
import { clearGuestCart, getGuestCartItems } from "@/service/cartService/cart.service";
import { syncGuestWishlistToServer } from "@/service/wishlistService/wishlist.service";
import { isAuthenticated } from "@/utils/auth";

export const syncGuestCartToServer = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  const guestItems = getGuestCartItems();
  if (guestItems.length === 0) return;

  try {
    for (const item of guestItems) {
      await api.post("/cart/add", {
        productId: item.productId,
        quantity: item.quantity,
      });
    }
    clearGuestCart();
  } catch (error) {
    console.error("Failed to sync guest cart:", error);
  }
};

export const syncGuestDataOnLogin = async (): Promise<void> => {
  await Promise.all([syncGuestCartToServer(), syncGuestWishlistToServer()]);
};
