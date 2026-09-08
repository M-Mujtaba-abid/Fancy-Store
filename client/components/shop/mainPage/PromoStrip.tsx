import Link from "next/link";

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
 */
export default function PromoStrip() {
  return (
    <Link
      href="/category/car_topCover"
      className="fixed inset-x-0 top-20 z-40 flex h-10 items-center justify-center overflow-hidden bg-slate-950 px-3 text-center text-amber-300 shadow-md transition-colors hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 sm:h-12"
      aria-label="Shop car and bike covers with flat 40 percent off"
    >
      {/* Chhoti screen par sirf offer - poori line bare text mein fit nahi hoti. */}
      <span className="whitespace-nowrap text-sm font-extrabold tracking-wide sm:hidden">
        🔥 FLAT 40% OFF on Car &amp; Bike Covers
      </span>

      <span className="hidden whitespace-nowrap font-extrabold tracking-wide sm:inline sm:text-base lg:text-lg">
        🔥 FLAT 40% OFF on All Car &amp; Bike Covers
        <span aria-hidden="true" className="mx-2.5 text-amber-300/40">
          |
        </span>
        🚚 Fast Delivery
        <span aria-hidden="true" className="mx-2.5 text-amber-300/40">
          |
        </span>
        💳 Cash on Delivery
      </span>
    </Link>
  );
}
