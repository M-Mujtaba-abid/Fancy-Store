import {
  ToggleWishlistPayload,
  ToggleWishlistResponse,
  WishlistItem,
} from "@/types/wishlist.type";
import { Product } from "@/types/product.type";
import { isAuthenticated } from "@/utils/auth";
import api from "../api";

const GUEST_WISHLIST_KEY = "fancy_store_guest_wishlist";

const guestWishlistHandler = {
  get: (): WishlistItem[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(GUEST_WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  },
  save: (items: WishlistItem[]) => {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  },
  clear: () => {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  },
};

const toWishlistItem = (productId: string, product: Product): WishlistItem => ({
  id: `guest_${Date.now()}_${productId}`,
  userId: "guest",
  productId,
  Product: product,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const syncGuestWishlistToServer = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  const guestItems = guestWishlistHandler.get();
  if (guestItems.length === 0) return;

  try {
    const res = await api.get("/wishlist");
    const serverItems: WishlistItem[] = res.data.data ?? [];
    const serverProductIds = new Set(
      serverItems.map((item) => String(item.productId)),
    );

    for (const item of guestItems) {
      if (!serverProductIds.has(String(item.productId))) {
        await api.post("/wishlist/toggle", { productId: item.productId });
      }
    }

    guestWishlistHandler.clear();
  } catch (error) {
    console.error("Failed to sync guest wishlist:", error);
  }
};

export const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    if (isAuthenticated()) {
      const res = await api.get("/wishlist");
      return res.data.data;
    }
    return guestWishlistHandler.get();
  },

  toggleWishlist: async ({
    productId,
    product,
  }: ToggleWishlistPayload): Promise<ToggleWishlistResponse> => {
    if (isAuthenticated()) {
      const res = await api.post("/wishlist/toggle", { productId });
      return {
        added: res.data.data.added,
        message: res.data.data.message ?? res.data.message,
      };
    }

    const items = guestWishlistHandler.get();
    const existingIndex = items.findIndex(
      (item) => String(item.productId) === String(productId),
    );

    if (existingIndex >= 0) {
      items.splice(existingIndex, 1);
      guestWishlistHandler.save(items);
      return {
        added: false,
        message: "Removed from wishlist",
        data: items,
      };
    }

    if (!product) {
      throw new Error("Product data is required for guest wishlist");
    }

    const updatedItems = [
      toWishlistItem(productId, { ...product, id: String(product.id) }),
      ...items,
    ];
    guestWishlistHandler.save(updatedItems);

    return {
      added: true,
      message: "Added to wishlist",
      data: updatedItems,
    };
  },
};
