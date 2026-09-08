import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";

export default function CarCoverDiscountBanner() {
  return (
    <section className="w-full bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10" aria-label="Car cover discount">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl border border-amber-400/25 bg-linear-to-r from-slate-950 via-slate-900 to-orange-950/80 px-5 py-6 shadow-xl shadow-orange-950/10 sm:flex-row sm:items-center sm:px-8 sm:py-7">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="shrink-0 rounded-xl bg-amber-400/15 p-3 text-amber-300">
            <Car size={24} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Limited-time offer</p>
            <h2 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl lg:text-3xl">🔥 Flat 40% Off on All Car Covers</h2>
            <p className="mt-1 text-sm text-slate-300">Keep your car protected through every season.</p>
          </div>
        </div>
        <Link href="/category/car_topCover" className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition-colors hover:bg-amber-300 sm:w-auto">
          Shop Now
          <ArrowRight size={17} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
