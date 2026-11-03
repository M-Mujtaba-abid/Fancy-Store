"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSaleLive, useStoreSettings } from "@/hooks/useSettings";
import type { StoreSettings } from "@/types/settings.type";

/**
 * Welcome popup. Do shaklein:
 *
 *   - 11.11 sale ON (admin: /dashboard/settings) aur end time nahi guzra:
 *     11.11 wala card, countdown ke sath.
 *   - warna: aam "Up to 40% OFF" offer.
 *
 * Visitor ke aane ke DELAY_MS baad ek dafa khulta hai. Band karne ke baad
 * REMEMBER_MS tak dobara nahi aata, warna har page change par chubhne lagta.
 * Ye choice localStorage mein rehti hai, is liye sirf usi browser ke liye hai
 * aur server tak nahi jati.
 *
 * Dono shaklon ki dismiss key alag hai: jis ne aam offer band kiya tha, usay
 * 11.11 sale shuru hone par naya popup phir bhi dikhna chahiye. Sale badal kar
 * popup dobara sab ko dikhana ho to key ka version barha dein (`-v2`).
 *
 * ⚠️ "Flat 40%" pehle likha tha, magar car cover prices barhne ke baad discount
 * 27% se 41% ke darmiyan hai. "Up to" hi sach hai.
 */
const STORAGE_KEY = "fancystore:sale-popup-dismissed-v1";
const SALE_STORAGE_KEY = "fancystore:sale-popup-1111-dismissed-v1";
const DELAY_MS = 1800;
const REMEMBER_MS = 30 * 60 * 1000; // 30 minute

// Popup in raaston par kabhi nahi dikhna chahiye - yahan customer already
// khareed raha hai, ya admin kaam kar raha hai.
const HIDDEN_PREFIXES = ["/dashboard", "/admin", "/login", "/signup", "/forget-password", "/checkout", "/cart"];

/** Har `intervalMs` par naya Date.now(), countdown ke liye. */
export const useNow = (intervalMs: number, enabled = true) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, enabled]);
  return now;
};

export const timeLeft = (endsAt: string, now: number) => {
  const ms = Math.max(0, new Date(endsAt).getTime() - now);
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
};

const pad = (value: number) => String(value).padStart(2, "0");

export default function SalePopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { data: settings, isFetched } = useStoreSettings();

  const saleLive = isSaleLive(settings);
  const storageKey = saleLive ? SALE_STORAGE_KEY : STORAGE_KEY;

  const isHiddenRoute = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const dismiss = useCallback(() => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // Private window ya blocked storage - popup is session mein band hai,
      // agli dafa phir aa jayega. Koi harj nahi.
    }
  }, [storageKey]);

  // Pehla render ke baad hi decide karo, warna server aur client ka HTML
  // match nahi karega (localStorage server par mojood nahi hota).
  //
  // Settings aane ka intezar bhi karte hain (`isFetched`, fail hone par bhi
  // true ho jata hai), warna pehle aam popup khulta aur phir 11.11 mein badal
  // jata.
  useEffect(() => {
    if (isHiddenRoute || !isFetched) return;

    let dismissedAt = 0;
    try {
      dismissedAt = Number(window.localStorage.getItem(storageKey)) || 0;
    } catch {
      dismissedAt = 0;
    }

    if (dismissedAt && Date.now() - dismissedAt < REMEMBER_MS) return;

    const timer = window.setTimeout(() => setIsOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isHiddenRoute, isFetched, storageKey]);

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

  if (!isOpen || isHiddenRoute) return null;

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
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/75 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
        tabIndex={-1}
      />

      {/* Bohot chhoti screen par andar scroll ho sakta hai, magar scrollbar
          chhupa rehta hai (card ke rounded kone par bhadda lagta tha). Width
          kabhi overflow nahi honi chahiye, is liye overflow-x-hidden. */}
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-3xl border border-amber-300/30 bg-slate-950 text-center shadow-2xl motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in motion-safe:duration-300">
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

        {saleLive && settings ? (
          <ElevenElevenCard settings={settings} onDismiss={dismiss} />
        ) : (
          <DefaultOfferCard freeDelivery={settings?.shippingFee === 0} onDismiss={dismiss} />
        )}
      </div>
    </div>
  );
}

const ctaClass =
  "mt-5 flex h-12 sm:mt-6 w-full items-center justify-center rounded-xl bg-amber-400 text-base font-extrabold text-slate-950 transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const laterClass =
  "mt-3 text-xs font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

function ElevenElevenCard({
  settings,
  onDismiss,
}: {
  settings: StoreSettings;
  onDismiss: () => void;
}) {
  const { sale, shippingFee } = settings;
  const now = useNow(1000);
  const left = timeLeft(sale.endsAt, now);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sale.couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard band ho to code screen par likha hua hai hi.
    }
  };

  const units = [
    { label: "Days", value: left.days },
    { label: "Hours", value: left.hours },
    { label: "Mins", value: left.minutes },
    { label: "Secs", value: left.seconds },
  ];

  return (
    <>
      {/* Gold aur red glow, taake card flat na lage.
          ⚠️ Apne overflow-hidden dabbe ke andar hi rehne chahiye: card ke
          bahar nikle to card unhe content samajh kar horizontal aur vertical
          scrollbar dikhata tha (red glow 64px right aur 80px neeche jata hai). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
      </div>

      <div className="relative px-5 pb-5 pt-9 sm:px-6 sm:pb-6 sm:pt-10">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-red-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 motion-safe:animate-pulse" />
          Mega Sale Live
        </p>

        <p
          id="sale-popup-title"
          className="mt-3 bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-6xl font-black sm:mt-4 sm:text-7xl leading-none tracking-tight text-transparent drop-shadow-[0_4px_24px_rgba(251,191,36,0.35)]"
        >
          11.11
        </p>

        <p id="sale-popup-description" className="mt-2 break-words text-2xl font-black uppercase leading-tight text-white sm:mt-3 sm:text-3xl">
          {sale.headline}
        </p>
        <p className="mt-1 text-sm text-slate-400">On all car &amp; bike top covers</p>

        {shippingFee === 0 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2 py-2 text-center text-[11px] font-extrabold uppercase leading-tight text-emerald-300 sm:mt-4 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm sm:tracking-wide">
            <span aria-hidden="true">🚚</span> Free delivery all over Pakistan
          </p>
        )}

        <div className="mt-4 sm:mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300/70">Sale ends in</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2" role="timer" aria-live="off">
            {units.map((unit) => (
              <div key={unit.label} className="min-w-0 rounded-xl border border-amber-300/20 bg-white/5 py-1.5 sm:py-2">
                <p className="text-xl font-black tabular-nums text-amber-300 sm:text-2xl">{pad(unit.value)}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{unit.label}</p>
              </div>
            ))}
          </div>
        </div>

        {sale.couponCode && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-amber-300/50 bg-amber-300/5 px-4 py-2.5 text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Extra off code</p>
              <p className="font-mono text-lg font-black tracking-wider text-amber-300">{sale.couponCode}</p>
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-lg bg-amber-300/15 px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        <Link href="/category/car_topCover" onClick={onDismiss} className={ctaClass}>
          Shop 11.11 Deals
        </Link>

        <p className="mt-3 text-xs text-slate-400">
          <span aria-hidden="true">💳</span> Cash on delivery available
        </p>

        <button type="button" onClick={onDismiss} className={laterClass}>
          No thanks, maybe later
        </button>
      </div>
    </>
  );
}

function DefaultOfferCard({
  freeDelivery,
  onDismiss,
}: {
  freeDelivery: boolean;
  onDismiss: () => void;
}) {
  return (
    <>
      {/* Gold glow, taake card flat na lage. Clip wajah: ElevenElevenCard dekhein. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      <div className="relative px-7 pb-7 pt-11">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300/80">
          Limited Time Offer
        </p>

        <p className="mt-3 text-sm font-bold uppercase tracking-[0.3em] text-amber-300/70">
          Up to
        </p>

        <p id="sale-popup-title" className="mt-1 text-5xl font-black leading-none text-amber-300">
          40% OFF
        </p>

        <p id="sale-popup-description" className="mt-5 text-base font-semibold text-white">
          On all car &amp; bike top covers
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          100% waterproof and dustproof covers, cut to fit your exact model.
        </p>

        <ul className="mt-5 space-y-2 text-left text-sm text-slate-300">
          <li className="flex items-center gap-2.5">
            <span aria-hidden="true">🚚</span>{" "}
            {freeDelivery ? "Free delivery across Pakistan" : "Fast delivery across Pakistan"}
          </li>
          <li className="flex items-center gap-2.5">
            <span aria-hidden="true">💳</span> Cash on delivery available
          </li>
        </ul>

        <Link href="/category/car_topCover" onClick={onDismiss} className={ctaClass}>
          Shop Covers Now
        </Link>

        <button type="button" onClick={onDismiss} className={laterClass}>
          No thanks, maybe later
        </button>
      </div>
    </>
  );
}
