/**
 * ==========================================
 * 🎯 META (FACEBOOK) PIXEL TRACKING UTILITIES
 * ==========================================
 * Safe helper functions to track Meta (Facebook) Pixel events
 * in Next.js without SSR issues.
 */

import "@/types/facebook.types";

export interface ProductData {
  id: string | number;
  name: string;
  price: number;
  category?: string;
}

export interface CartItem extends ProductData {
  quantity?: number;
}

/**
 * Check if window and fbq are available
 */
const isMetaAvailable = (): boolean => {
  return typeof window !== "undefined" && typeof window.fbq === "function";
};

/**
 * 1️⃣ PAGE VIEW
 */
export const trackMetaPageView = (): void => {
  if (!isMetaAvailable()) return;
  try {
    window.fbq("track", "PageView");
  } catch (error) {
    console.error("❌ [Meta Pixel] PageView error:", error);
  }
};

/**
 * 2️⃣ VIEW CONTENT (Product view)
 */
export const trackMetaViewContent = (product: ProductData): void => {
  if (!isMetaAvailable()) return;
  try {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      // Conditional spread — pehle unconditional tha, to category missing hone
      // pe `content_category: undefined` emit hota tha
      ...(product.category && { content_category: product.category }),
      content_ids: [String(product.id)],
      content_type: "product",
      value: product.price,
      currency: "PKR",
    });
  } catch (error) {
    console.error("❌ [Meta Pixel] ViewContent error:", error);
  }
};

/**
 * 3️⃣ ADD TO CART
 */
export const trackMetaAddToCart = (
  product: ProductData,
  quantity: number = 1
): void => {
  if (!isMetaAvailable()) return;
  try {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      // Conditional spread — pehle unconditional tha, to category missing hone
      // pe `content_category: undefined` emit hota tha
      ...(product.category && { content_category: product.category }),
      content_ids: [String(product.id)],
      content_type: "product",
      value: product.price * quantity,
      currency: "PKR",
      contents: [
        {
          id: String(product.id),
          quantity: quantity,
          item_price: product.price,
        },
      ],
    });
  } catch (error) {
    console.error("❌ [Meta Pixel] AddToCart error:", error);
  }
};

/**
 * 4️⃣ ADD TO WISHLIST
 */
export const trackMetaAddToWishlist = (product: ProductData): void => {
  if (!isMetaAvailable()) return;
  try {
    window.fbq("track", "AddToWishlist", {
      content_name: product.name,
      // Conditional spread — pehle unconditional tha, to category missing hone
      // pe `content_category: undefined` emit hota tha
      ...(product.category && { content_category: product.category }),
      content_ids: [String(product.id)],
      content_type: "product",
      value: product.price,
      currency: "PKR",
    });
  } catch (error) {
    console.error("❌ [Meta Pixel] AddToWishlist error:", error);
  }
};

/**
 * 5️⃣ SEARCH
 */
export const trackMetaSearch = (
  searchQuery: string,
  results?: ProductData[]
): void => {
  if (!isMetaAvailable()) return;
  try {
    const contentIds = results ? results.slice(0, 5).map((p) => String(p.id)) : [];
    window.fbq("track", "Search", {
      search_string: searchQuery,
      content_ids: contentIds,
      content_type: "product",
      currency: "PKR",
    });
  } catch (error) {
    console.error("❌ [Meta Pixel] Search error:", error);
  }
};

/**
 * 6️⃣ INITIATE CHECKOUT
 */
export const trackMetaInitiateCheckout = (cartItems: CartItem[]): void => {
  if (!isMetaAvailable()) return;
  try {
    const contentIds = cartItems.map((item) => String(item.id));
    const totalValue = cartItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    const numItems = cartItems.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    // Meta ek hi content_category leta hai, to cart ki distinct categories
    // ko comma-separated bhejte hain. Pehle ye event category BILKUL nahi
    // bhejta tha — yani funnel ke sab se ahem step pe attribution missing thi.
    const categories = Array.from(
      new Set(cartItems.map((item) => item.category).filter(Boolean))
    );

    window.fbq("track", "InitiateCheckout", {
      content_ids: contentIds,
      content_type: "product",
      ...(categories.length && { content_category: categories.join(",") }),
      num_items: numItems,
      value: totalValue,
      currency: "PKR",
      contents: cartItems.map((item) => ({
        id: String(item.id),
        quantity: item.quantity || 1,
        item_price: item.price,
        ...(item.category && { item_category: item.category }),
      })),
    });
  } catch (error) {
    console.error("❌ [Meta Pixel] InitiateCheckout error:", error);
  }
};

/**
 * 7️⃣ PURCHASE
 */
export const trackMetaPurchase = (
  cartItems: CartItem[],
  orderId?: string
): void => {
  if (!isMetaAvailable()) return;
  try {
    const contentIds = cartItems.map((item) => String(item.id));
    const totalValue = cartItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    const numItems = cartItems.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    // Revenue attribution ke liye sab se ahem jagah — yahan pehle category
    // bilkul nahi jati thi, to Meta mein kaunsi category se sale hui ye pata
    // hi nahi chalta tha.
    const categories = Array.from(
      new Set(cartItems.map((item) => item.category).filter(Boolean))
    );

    const eventPayload: any = {
      content_ids: contentIds,
      content_type: "product",
      ...(categories.length && { content_category: categories.join(",") }),
      num_items: numItems,
      value: totalValue,
      currency: "PKR",
      contents: cartItems.map((item) => ({
        id: String(item.id),
        quantity: item.quantity || 1,
        item_price: item.price,
        ...(item.category && { item_category: item.category }),
      })),
    };

    if (orderId) {
      eventPayload.order_id = orderId;
    }

    window.fbq("track", "Purchase", eventPayload);
  } catch (error) {
    console.error("❌ [Meta Pixel] Purchase error:", error);
  }
};

/**
 * 8️⃣ COMPLETE REGISTRATION
 */
export const trackMetaCompleteRegistration = (userData?: {
  userId?: string;
  email?: string;
}): void => {
  if (!isMetaAvailable()) return;
  try {
    window.fbq("track", "CompleteRegistration", {
      currency: "PKR",
      status: "completed",
    });
  } catch (error) {
    console.error("❌ [Meta Pixel] CompleteRegistration error:", error);
  }
};

/**
 * 9️⃣ CUSTOM EVENT
 */
export const trackMetaCustomEvent = (
  eventName: string,
  eventData: Record<string, any> = {}
): void => {
  if (!isMetaAvailable()) return;
  try {
    window.fbq("trackCustom", eventName, eventData);
  } catch (error) {
    console.error(`❌ [Meta Pixel] Custom event (${eventName}) error:`, error);
  }
};
