"use client";

import { useEffect } from "react";
import { couponStorage } from "@/service/couponService/coupon.service";

/**
 * Promoter ke link (?ref=CODE) se aaye code ko yaad rakh leta hai.
 *
 * Influencer coupon programs ki sab se bari leak ye hai ke customer code type
 * karna bhool jata hai: usne story dekhi, do din baad site par aaya, aur code
 * kahin gum ho gaya. Promoter ko us sale ka credit nahi milta aur customer ko
 * discount nahi milta. Link se aane par hum code khud pakar lete hain aur
 * checkout par pehle se bhar dete hain.
 *
 * ⚠️ useSearchParams jaan bujh kar istemal NAHI kiya.
 *
 * Ye component har page par chalta hai. useSearchParams poore route ko Suspense
 * boundary maangta hai, aur bina uske static pages build par fail hoti hain.
 * window.location.search useEffect ke andar bilkul mehfooz hai kyunke wo sirf
 * browser mein chalta hai.
 *
 * Kuch bhi render nahi karta.
 */
export default function CouponRefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (!ref) return;

      const code = ref.trim().toUpperCase();
      // Sirf woh shakal jo coupon code ho sakti hai. Is se koi random query
      // string storage mein nahi girti.
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return;

      couponStorage.save(code);
    } catch {
      // Storage band ho sakti hai (private window). Customer phir bhi code
      // haath se daal sakta hai, is liye chup chaap chhor dete hain.
    }
  }, []);

  return null;
}
