"use client";

import Link from "next/link";
import { isSaleLive, useStoreSettings } from "@/hooks/useSettings";
import { timeLeft, useNow } from "./SalePopup";

/**
 * Navbar ke neeche pinned sale strip.
 *
 * Navbar khud `fixed top-0` hai aur uski height 5rem (h-20) hai, jise
 * globals.css ka `body { padding-top: 5rem }` offset karta hai. Ye strip usi
 * ke theek neeche `top-20` par baithti hai, is liye scroll karne par bhi
 * hamesha nazar aati hai.
 *
 * Page content ko iske neeche se shuru karne ke liye AppShell ek spacer div
 * render karta hai. Body ki padding badalna theek nahi tha, kyunke wo admin
 * aur auth pages par bhi lagti hai jahan na navbar hota hai na ye strip.
 * Spacer ki height yahan ki height se match honi chahiye (h-10 sm:h-12).
 *
 * Text admin Settings se aata hai (11.11 sale on/off, free delivery). Settings
 * aane se pehle, aur backend down ho to, aam offer dikhta hai. Server HTML bhi
 * wahi hota hai, is liye hydration mismatch nahi hota.
 */
const Divider = () => (
  <span aria-hidden="true" className="mx-2.5 text-amber-300/40">
    |
  </span>
);

export default function PromoStrip() {
  const { data: settings } = useStoreSettings();
  const saleLive = isSaleLive(settings);
  const freeDelivery = settings?.shippingFee === 0;
  const now = useNow(30 * 1000, saleLive);

  const deliveryText = freeDelivery ? "🚚 FREE Delivery" : "🚚 Fast Delivery";

  if (saleLive && settings) {
    const left = timeLeft(settings.sale.endsAt, now);
    const endsIn =
      left.days > 0 ? `${left.days}d ${left.hours}h` : `${left.hours}h ${left.minutes}m`;

    return (
      <Link
        href="/category/car_topCover"
        className="fixed inset-x-0 top-20 z-40 flex h-10 items-center justify-center overflow-hidden bg-gradient-to-r from-red-700 via-slate-950 to-red-700 px-3 text-center text-amber-300 shadow-md transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 sm:h-12"
        aria-label={`11.11 sale: ${settings.sale.headline}${freeDelivery ? " with free delivery" : ""}`}
      >
        <span className="whitespace-nowrap text-sm font-extrabold tracking-wide sm:hidden">
          🔥 11.11: {settings.sale.headline}
          {freeDelivery && " + Free Delivery"}
        </span>

        <span className="hidden whitespace-nowrap font-extrabold tracking-wide sm:inline sm:text-base lg:text-lg">
          🔥 11.11 MEGA SALE: {settings.sale.headline}
          <Divider />
          {deliveryText}
          <Divider />
          ⏰ Ends in <span className="tabular-nums">{endsIn}</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/category/car_topCover"
      className="fixed inset-x-0 top-20 z-40 flex h-10 items-center justify-center overflow-hidden bg-slate-950 px-3 text-center text-amber-300 shadow-md transition-colors hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 sm:h-12"
      aria-label="Shop car and bike covers with up to 40 percent off"
    >
      {/* Chhoti screen par sirf offer - poori line bare text mein fit nahi hoti. */}
      <span className="whitespace-nowrap text-sm font-extrabold tracking-wide sm:hidden">
        🔥 UP TO 40% OFF{freeDelivery ? " + Free Delivery" : " on Car & Bike Covers"}
      </span>

      <span className="hidden whitespace-nowrap font-extrabold tracking-wide sm:inline sm:text-base lg:text-lg">
        🔥 UP TO 40% OFF on All Car &amp; Bike Covers
        <Divider />
        {deliveryText}
        <Divider />
        💳 Cash on Delivery
      </span>
    </Link>
  );
}
