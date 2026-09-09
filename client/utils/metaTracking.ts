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
 * ⏳ PIXEL READY HONE KA INTEZAR
 *
 * Pixel `strategy="lazyOnload"` se load hota hai (app/layout.tsx), yani window
 * load ke baad. Lekin ViewContent jaisa event component ke mount par, hydration
 * ke foran baad fire hota hai — us waqt `window.fbq` mojood hi nahi hota.
 *
 * Pehle aise event sirf `if (!isMetaAvailable()) return;` se chup-chaap gir
 * jate the, bilkul khamoshi se. Nateeja: Meta ko product views milte hi nahi
 * the, aur Commerce Manager catalogue match rate 0% ("Product views: Missing")
 * dikhata tha.
 *
 * Ab event ko queue kar dete hain aur fbq aate hi usi tarteeb se bhej dete
 * hain. WAIT_LIMIT_MS ke baad chhor dete hain — agar pixel block ho (ad
 * blocker, consent tool) to hamesha poll karte rehna faltu hai.
 */
const WAIT_LIMIT_MS = 15000;
const POLL_MS = 250;

let pendingEvents: Array<() => void> = [];
let pollTimer: ReturnType<typeof setInterval> | null = null;
let waitedMs = 0;

const flushPendingEvents = (): void => {
  const queued = pendingEvents;
  pendingEvents = [];
  for (const run of queued) {
    try {
      run();
    } catch (error) {
      console.error("❌ [Meta Pixel] queued event error:", error);
    }
  }
};

const stopPolling = (): void => {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

const startPolling = (): void => {
  if (pollTimer !== null) return;

  waitedMs = 0;
  pollTimer = setInterval(() => {
    waitedMs += POLL_MS;

    if (isMetaAvailable()) {
      stopPolling();
      flushPendingEvents();
      return;
    }

    if (waitedMs >= WAIT_LIMIT_MS) {
      stopPolling();
      // Pixel aaya hi nahi — queue chhor do, warna memory mein pari rahegi.
      pendingEvents = [];
    }
  }, POLL_MS);
};

/**
 * Event ko foran bhejta hai agar pixel tayyar hai, warna tayyar hone tak
 * queue kar deta hai. Har track function isi ke through jata hai.
 */
const sendWhenReady = (send: () => void): void => {
  if (typeof window === "undefined") return;

  if (isMetaAvailable()) {
    try {
      send();
    } catch (error) {
      console.error("❌ [Meta Pixel] event error:", error);
    }
    return;
  }

  pendingEvents.push(send);
  startPolling();
};

/**
 * 1️⃣ PAGE VIEW
 */
export const trackMetaPageView = (): void => {
  sendWhenReady(() => {
    window.fbq("track", "PageView");
  });
};

/**
 * 2️⃣ VIEW CONTENT (Product view)
 */
export const trackMetaViewContent = (product: ProductData): void => {
  sendWhenReady(() => {
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
  });
};

/**
 * 3️⃣ ADD TO CART
 */
export const trackMetaAddToCart = (
  product: ProductData,
  quantity: number = 1
): void => {
  sendWhenReady(() => {
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
  });
};

/**
 * 4️⃣ ADD TO WISHLIST
 */
export const trackMetaAddToWishlist = (product: ProductData): void => {
  sendWhenReady(() => {
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
  });
};

/**
 * 5️⃣ SEARCH
 */
export const trackMetaSearch = (
  searchQuery: string,
  results?: ProductData[]
): void => {
  const contentIds = results ? results.slice(0, 5).map((p) => String(p.id)) : [];
  sendWhenReady(() => {
    window.fbq("track", "Search", {
      search_string: searchQuery,
      content_ids: contentIds,
      content_type: "product",
      currency: "PKR",
    });
  });
};

/**
 * 6️⃣ INITIATE CHECKOUT
 */
export const trackMetaInitiateCheckout = (cartItems: CartItem[]): void => {
  sendWhenReady(() => {
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
  });
};

/**
 * 7️⃣ PURCHASE
 */
export const trackMetaPurchase = (
  cartItems: CartItem[],
  orderId?: string
): void => {
  sendWhenReady(() => {
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
  });
};

/**
 * 8️⃣ COMPLETE REGISTRATION
 */
export const trackMetaCompleteRegistration = (userData?: {
  userId?: string;
  email?: string;
}): void => {
  sendWhenReady(() => {
    window.fbq("track", "CompleteRegistration", {
      currency: "PKR",
      status: "completed",
    });
  });
};

/**
 * 9️⃣ CUSTOM EVENT
 */
export const trackMetaCustomEvent = (
  eventName: string,
  eventData: Record<string, any> = {}
): void => {
  sendWhenReady(() => {
    window.fbq("trackCustom", eventName, eventData);
  });
};
