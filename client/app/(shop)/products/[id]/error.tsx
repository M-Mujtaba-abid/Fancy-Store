"use client";

// app/(shop)/products/[id]/error.tsx
//
// Ye page.tsx ke `throw` ka user-facing hissa hai.
//
// Pehle backend glitch par page khud ek 200 OK HTML return karta tha jis mein
// "Something went wrong" likha hota. Us route par ab ISR hai, aur Next har
// kaamyab render ko cache kar deta hai — yani ek lamhe ki kharabi 5 minute ke
// liye cache ho jati. Is liye page ab throw karta hai (kuch cache nahi hota,
// Googlebot ko 500 milta hai = "baad mein dobara koshish karo", deindex nahi)
// aur user ko ye boundary dikhti hai.

import Link from "next/link";

export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
        Product could not be loaded
      </h1>
      <p className="mt-3 max-w-md text-text-muted">
        Kuch der ke liye masla aa gaya hai. Dobara koshish karein — product
        hata nahi gaya.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-main transition-colors hover:border-primary hover:text-primary"
        >
          Browse all products
        </Link>
      </div>
    </div>
  );
}
