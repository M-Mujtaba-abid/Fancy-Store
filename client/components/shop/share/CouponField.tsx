"use client";

import React, { useRef, useState, useSyncExternalStore } from "react";
import { Tag, X, Loader2, Check } from "lucide-react";
import { couponService, couponStorage } from "@/service/couponService/coupon.service";
import type { AppliedCoupon } from "@/types/coupon.type";

interface Props {
  subtotal: number;
  phone?: string;
  email?: string;
  applied: AppliedCoupon | null;
  onApplied: (coupon: AppliedCoupon | null) => void;
}

/**
 * localStorage ko useSyncExternalStore se parhte hain, useEffect se nahi.
 *
 * Do wajuhat:
 *   1. useState ke initializer mein parhna hydration tod deta hai: server par
 *      storage hoti hi nahi, to server "" render karta aur client saved code.
 *   2. useEffect mein parh kar setState karna wahi kaam ghuma phira kar karta
 *      hai aur React ka set-state-in-effect rule bhi pakarta hai.
 *
 * useSyncExternalStore isi soorat ke liye bana hai: server snapshot "" deta
 * hai, client snapshot asal value, aur React dono ko theek se jorta hai.
 * Subscribe ki zaroorat nahi kyunke code sirf mount par parhna hai.
 */
const noopSubscribe = () => () => {};
const readSaved = () => couponStorage.read();
const serverSnapshot = () => "";

/**
 * Checkout ka coupon box.
 *
 * ⚠️ Input jaan bujh kar CHHUPA hua hai, ek link ke peeche.
 *
 * Khula hua "Discount Code" box dekh kar bohat se log checkout chhor kar
 * coupon dhoondne chale jate hain aur wapas nahi aate (Baymard aur Voucherify
 * ki research mein ye 20 se 27% tak jata hai). Jise code mila hua hai wo link
 * par click kar lega; jise nahi mila usay yaad hi nahi dilana behtar hai.
 *
 * Promoter ke link (?ref=CODE) se aaya code khud bhar jata hai aur box khula
 * hua dikhta hai, kyunke us customer ke paas code hai hi.
 */
export default function CouponField({
  subtotal,
  phone,
  email,
  applied,
  onApplied,
}: Props) {
  const savedCode = useSyncExternalStore(noopSubscribe, readSaved, serverSnapshot);

  // `typed` null hone ka matlab: user ne abhi kuch likha hi nahi, to promoter
  // ke link wala code hi dikhega.
  const [typed, setTyped] = useState<string | null>(null);
  const [userOpened, setUserOpened] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const code = typed ?? savedCode;
  // Link se code aaya ho to box pehle se khula rakhte hain: us customer ke paas
  // code hai hi, usay ek extra click karwane ka koi faida nahi.
  const open = userOpened || Boolean(savedCode);

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a coupon code.");
      return;
    }

    setIsChecking(true);
    setError("");
    try {
      const result = await couponService.validate({
        code: trimmed,
        subtotal,
        phone,
        email,
      });
      onApplied(result);
      couponStorage.save(result.code);
    } catch (err: unknown) {
      // Backend ka message seedha dikhate hain ("You have already used this
      // coupon", "This coupon has expired") - wo customer ke liye likhe gaye
      // hain aur generic message se kahin zyada kaam ke hain.
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not apply this coupon.";
      setError(message);
      onApplied(null);
    } finally {
      setIsChecking(false);
    }
  };

  const remove = () => {
    onApplied(null);
    setTyped("");
    setError("");
    couponStorage.clear();
    // Box khula rehne do taake customer doosra code likh sake.
    setUserOpened(true);
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-green-500/40 bg-green-500/5 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Check size={16} className="text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main truncate">
              {applied.code} applied
            </p>
            <p className="text-xs text-text-muted">
              You saved Rs. {applied.discountAmount.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          className="flex-shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
          aria-label="Remove coupon"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setUserOpened(true);
          // Box khulte hi cursor andar, taake ek extra tap na lage.
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
      >
        <Tag size={15} />
        Have a coupon code?
      </button>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={code}
          // Uppercase yahin kar dete hain taake customer ko wahi shakal dikhe
          // jo server compare karta hai.
          onChange={(e) => {
            setTyped(e.target.value.toUpperCase());
            if (error) setError("");
          }}
          // Form ke andar Enter dabane se checkout submit ho jata tha, is liye
          // Enter ko yahin rok kar coupon apply par bhej dete hain.
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void apply();
            }
          }}
          placeholder="Coupon code"
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm uppercase tracking-wider outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={() => void apply()}
          disabled={isChecking}
          className="flex-shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isChecking ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
