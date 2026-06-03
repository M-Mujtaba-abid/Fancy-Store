/**
 * ==========================================
 * 🎯 TIKTOK PIXEL TRACKING UTILITIES
 * ==========================================
 * This file contains helper functions to safely track TikTok Pixel events
 * in your Next.js application without SSR errors.
 *
 * ALWAYS use these functions instead of calling ttq directly!
 */

/**
 * Type definitions for product data
 */
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
 * ==========================================
 * SAFE TIKTOK TRACKING HELPER
 * ==========================================
 * Checks if window and ttq exist before tracking (prevents SSR errors)
 */
const isTikTokAvailable = (): boolean => {
  const isWindowAvailable = typeof window !== "undefined";
  const isTtqAvailable = isWindowAvailable && typeof window.ttq !== "undefined";

  console.log("🎯 [TTQ Check] Window available:", isWindowAvailable);
  console.log("🎯 [TTQ Check] TTQ available:", isTtqAvailable);
  if (isWindowAvailable) {
    console.log("🎯 [TTQ Check] window.ttq value:", window.ttq);
  }

  return isTtqAvailable;
};

/**
 * ==========================================
 * 1️⃣ IDENTIFY USER (PII Data - Optional)
 * ==========================================
 * Call this when user logs in to send hashed user data
 * Note: Email and phone must be hashed with SHA-256 on client side
 */
export const identifyTikTokUser = (userData: {
  email?: string;
  phone?: string;
  externalId?: string;
}): void => {
  // 🎯 TIKTOK CONTENT CODE: User Identification
  if (!isTikTokAvailable()) return;

  const identifyData: any = {};
  if (userData.email) identifyData.email = userData.email;
  if (userData.phone) identifyData.phone_number = userData.phone;
  if (userData.externalId) identifyData.external_id = userData.externalId;

  if (Object.keys(identifyData).length > 0) {
    window.ttq.identify(identifyData);
  }
};

/**
 * ==========================================
 * 2️⃣ VIEW CONTENT (Page/Product View)
 * ==========================================
 * Triggered when user views a product page
 */
export const trackViewContent = (product: ProductData): void => {
  // 🎯 TIKTOK CONTENT CODE: View Product Page
  if (!isTikTokAvailable()) return;

  window.ttq.track("ViewContent", {
    contents: [
      {
        content_id: String(product.id),
        content_type: "product" as const, // Hardcoded
        content_name: product.name,
        price: product.price,
        ...(product.category && { content_category: product.category }),
      },
    ],
    value: product.price,
    currency: "PKR", // Hardcoded
  });
};

/**
 * ==========================================
 * 3️⃣ ADD TO CART
 * ==========================================
 * Triggered when user clicks "Add to Cart" button
 */
export const trackAddToCart = (
  product: ProductData,
  quantity: number = 1,
): void => {
  // 🎯 TIKTOK CONTENT CODE: Add Product to Cart
  console.log("🎯 [trackAddToCart] Function called with product:", product, "quantity:", quantity);

  if (!isTikTokAvailable()) {
    console.warn("❌ [trackAddToCart] TTQ not available - tracking skipped");
    return;
  }

  console.log("🎯 [trackAddToCart] TTQ is available, firing event...");

  try {
    const eventPayload = {
      contents: [
        {
          content_id: String(product.id),
          content_type: "product" as const, // Hardcoded
          content_name: product.name,
          price: product.price,
          ...(product.category && { content_category: product.category }),
        },
      ],
      value: product.price * quantity,
      currency: "PKR", // Hardcoded
    };

    console.log("🎯 [trackAddToCart] Event payload:", eventPayload);

    window.ttq.track("AddToCart", eventPayload);

    console.log("✅ [trackAddToCart] Event fired successfully!");
  } catch (error) {
    console.error("❌ [trackAddToCart] Error firing event:", error);
  }
};

/**
 * ==========================================
 * 4️⃣ ADD TO WISHLIST
 * ==========================================
 * Triggered when user clicks "Add to Wishlist" button
 */
export const trackAddToWishlist = (product: ProductData): void => {
  // 🎯 TIKTOK CONTENT CODE: Add Product to Wishlist
  if (!isTikTokAvailable()) return;

  window.ttq.track("AddToWishlist", {
    contents: [
      {
        content_id: String(product.id),
        content_type: "product" as const, // Hardcoded
        content_name: product.name,
        ...(product.category && { content_category: product.category }),
      },
    ],
    currency: "PKR", // Hardcoded
  });
};

/**
 * ==========================================
 * 5️⃣ SEARCH
 * ==========================================
 * Triggered when user performs a search
 */
export const trackSearch = (
  searchQuery: string,
  results?: ProductData[],
): void => {
  // 🎯 TIKTOK CONTENT CODE: User Search Action
  if (!isTikTokAvailable()) return;

  const contents = results
    ? results.slice(0, 3).map((product) => ({
        content_id: String(product.id),
        content_type: "product" as const,
        content_name: product.name,
        ...(product.category && { content_category: product.category }),
      }))
    : [];

  window.ttq.track("Search", {
    search_string: searchQuery,
    ...(contents.length > 0 && { contents }),
    currency: "PKR", // Hardcoded
  });
};

/**
 * ==========================================
 * 6️⃣ INITIATE CHECKOUT
 * ==========================================
 * Triggered when user proceeds to checkout
 */
export const trackInitiateCheckout = (cartItems: CartItem[]): void => {
  // 🎯 TIKTOK CONTENT CODE: Checkout Started
  if (!isTikTokAvailable()) return;

  const contents = cartItems.map((item) => ({
    content_id: String(item.id),
    content_type: "product" as const, // Hardcoded
    content_name: item.name,
    price: item.price,
    ...(item.category && { content_category: item.category }),
  }));

  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  window.ttq.track("InitiateCheckout", {
    contents,
    value: totalValue,
    currency: "PKR", // Hardcoded
  });
};

/**
 * ==========================================
 * 7️⃣ ADD PAYMENT INFO
 * ==========================================
 * Triggered when user enters payment information
 */
export const trackAddPaymentInfo = (cartItems: CartItem[]): void => {
  // 🎯 TIKTOK CONTENT CODE: Payment Info Added
  if (!isTikTokAvailable()) return;

  const contents = cartItems.map((item) => ({
    content_id: String(item.id),
    content_type: "product" as const, // Hardcoded
    content_name: item.name,
    price: item.price,
    ...(item.category && { content_category: item.category }),
  }));

  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  window.ttq.track("AddPaymentInfo", {
    contents,
    value: totalValue,
    currency: "PKR", // Hardcoded
  });
};

/**
 * ==========================================
 * 8️⃣ PLACE AN ORDER
 * ==========================================
 * Triggered when user places an order (before payment success)
 */
export const trackPlaceAnOrder = (
  cartItems: CartItem[],
  orderStatus: string = "submitted",
): void => {
  // 🎯 TIKTOK CONTENT CODE: Order Placed
  if (!isTikTokAvailable()) return;

  const contents = cartItems.map((item) => ({
    content_id: String(item.id),
    content_type: "product" as const, // Hardcoded
    content_name: item.name,
    price: item.price,
    ...(item.category && { content_category: item.category }),
  }));

  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  window.ttq.track("PlaceAnOrder", {
    contents,
    value: totalValue,
    currency: "PKR", // Hardcoded
    status: orderStatus,
  });
};

/**
 * ==========================================
 * 9️⃣ PURCHASE / COMPLETE PAYMENT
 * ==========================================
 * Triggered when payment is successfully completed
 * (This is the MOST IMPORTANT event for ROI tracking)
 */
export const trackPurchase = (
  cartItems: CartItem[],
  orderId?: string,
): void => {
  // 🎯 TIKTOK CONTENT CODE: Purchase Completed (MOST IMPORTANT!)
  if (!isTikTokAvailable()) return;

  const contents = cartItems.map((item) => ({
    content_id: String(item.id),
    content_type: "product" as const, // Hardcoded
    content_name: item.name,
    price: item.price,
    ...(item.category && { content_category: item.category }),
  }));

  const totalValue = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  const eventData: any = {
    contents,
    value: totalValue,
    currency: "PKR", // Hardcoded
  };

  if (orderId) {
    eventData.order_id = orderId;
  }

  window.ttq.track("Purchase", eventData);
};

/**
 * ==========================================
 * 🔟 COMPLETE REGISTRATION
 * ==========================================
 * Triggered when user completes signup/registration
 */
export const trackCompleteRegistration = (userData: {
  userId?: string;
  email?: string;
}): void => {
  // 🎯 TIKTOK CONTENT CODE: User Registration Complete
  if (!isTikTokAvailable()) return;

  const eventData: any = {
    content_type: "product", // Hardcoded
    currency: "PKR", // Hardcoded
  };

  if (userData.userId) {
    eventData.external_id = userData.userId;
  }

  window.ttq.track("CompleteRegistration", eventData);
};

/**
 * ==========================================
 * 1️⃣1️⃣ CUSTOM EVENT
 * ==========================================
 * For any custom event tracking
 */
export const trackCustomEvent = (
  eventName: string,
  eventData: Record<string, any>,
): void => {
  // 🎯 TIKTOK CONTENT CODE: Custom Event
  if (!isTikTokAvailable()) return;

  window.ttq.track(eventName, eventData);
};
