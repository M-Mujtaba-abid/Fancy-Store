import Link from "next/link";

const announcement = "🔥 Flat 40% Off on All Car Covers  |  🚚 Fast Delivery Across Pakistan  |  💳 Cash on Delivery  |  ⏰ Offer Ends Soon — Order Now!";

export default function PromoStrip() {
  return (
    <Link
      href="/category/car_topCover"
      className="group block h-9 w-full overflow-hidden bg-slate-950 text-amber-300 transition-colors hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-inset sm:h-10"
      aria-label="Shop car covers with 40 percent off"
    >
      <div className="flex h-full w-max items-center whitespace-nowrap will-change-transform promo-marquee motion-reduce:animate-none">
        <span className="px-5 text-xs font-bold tracking-wide sm:text-sm">{announcement}</span>
        <span aria-hidden="true" className="px-5 text-xs font-bold tracking-wide sm:text-sm">{announcement}</span>
      </div>
    </Link>
  );
}
