"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * FLAT 40% OFF ka welcome popup.
 *
 * Visitor ke aane ke DELAY_MS baad ek dafa khulta hai. Band karne ke baad
 * REMEMBER_MS tak dobara nahi aata, warna har page change par chubhne lagta.
 * Ye choice localStorage mein rehti hai, is liye sirf usi browser ke liye hai
 * aur server tak nahi jati.
 *
 * STORAGE_KEY ke akhir mein version hai: sale badal kar popup dobara sab ko
 * dikhana ho to key ko `-v2` kar dein, purani dismiss state khud-ba-khud
 * bekaar ho jayegi.
 */
const STORAGE_KEY = "fancystore:sale-popup-dismissed-v1";
const DELAY_MS = 1800;
const REMEMBER_MS = 30 * 60 * 1000; // 30 minute

// Popup in raaston par kabhi nahi dikhna chahiye - yahan customer already
// khareed raha hai, ya admin kaam kar raha hai.
const HIDDEN_PREFIXES = ["/dashboard", "/admin", "/login", "/signup", "/forget-password", "/checkout", "/cart"];

export default function SalePopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isHiddenRoute = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const dismiss = useCallback(() => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Private window ya blocked storage - popup is session mein band hai,
      // agli dafa phir aa jayega. Koi harj nahi.
    }
  }, []);

  // Pehla render ke baad hi decide karo, warna server aur client ka HTML
  // match nahi karega (localStorage server par mojood nahi hota).
  useEffect(() => {
    if (isHiddenRoute) return;

    let dismissedAt = 0;
    try {
      dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      dismissedAt = 0;
    }

    if (dismissedAt && Date.now() - dismissedAt < REMEMBER_MS) return;

    const timer = window.setTimeout(() => setIsOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isHiddenRoute]);

  // Escape se band ho, aur khulte waqt background scroll ruk jaye.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    // Scrollbar ki jagah bhar do, warna page ek jhatke se hil jata hai.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-popup-title"
      aria-describedby="sale-popup-description"
    >
      <button
        type="button"
        aria-label="Close offer"
        onClick={dismiss}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/70 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
        tabIndex={-1}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-300/30 bg-slate-950 text-center shadow-2xl motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in motion-safe:duration-300">
        {/* Gold glow, taake card flat na lage. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-400/25 blur-3xl"
        />

        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          aria-label="Close offer"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative px-7 pb-7 pt-11">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300/80">
            Limited Time Offer
          </p>

          <p id="sale-popup-title" className="mt-3 text-5xl font-black leading-none text-amber-300">
            40% OFF
          </p>

          <p className="mt-1 text-sm font-bold uppercase tracking-[0.3em] text-amber-300/70">
            Flat
          </p>

          <p id="sale-popup-description" className="mt-5 text-base font-semibold text-white">
            On all car &amp; bike top covers
          </p>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            100% waterproof and dustproof covers, cut to fit your exact model.
          </p>

          <ul className="mt-5 space-y-2 text-left text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <span aria-hidden="true">🚚</span> Fast delivery across Pakistan
            </li>
            <li className="flex items-center gap-2.5">
              <span aria-hidden="true">💳</span> Cash on delivery available
            </li>
          </ul>

          <Link
            href="/category/car_topCover"
            onClick={dismiss}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-amber-400 text-base font-extrabold text-slate-950 transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Shop Covers Now
          </Link>

          <button
            type="button"
            onClick={dismiss}
            className="mt-3 text-xs font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
