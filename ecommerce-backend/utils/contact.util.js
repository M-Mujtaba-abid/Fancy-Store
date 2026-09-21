/**
 * Phone aur email ko ek canonical shakal mein laane wale helpers.
 *
 * Ye coupon system ka sab se nazuk hissa hai. Per-customer limit isi par
 * chalti hai: agar normalization kamzor hui to ek hi banda thora sa format
 * badal kar bar bar discount le lega, aur agar zarurat se zyada aggressive hui
 * to do alag customers ek samajh liye jayenge aur doosre ko ghalat reject
 * milega.
 */

/**
 * Pakistani mobile number ko "03001234567" wali shakal mein laata hai.
 *
 * Ek hi banda ye sab likh sakta hai aur string compare mein ye paanch alag
 * log lagte hain:
 *
 *     03001234567
 *     0300-1234567
 *     +92 300 1234567
 *     923001234567
 *     00923001234567
 *
 * Jo number is shakal mein fit na ho (landline, ghalat typing, ya koi doosre
 * mulk ka) usay bhi REJECT nahi karte - bas uske digits laut ate hain. Maqsad
 * order rokna nahi, sirf ek hi number ko baar baar ginne se bachana hai.
 */
export const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return null;

  // International prefix "00" hata do: 00923001234567 -> 923001234567
  let rest = digits.startsWith("00") ? digits.slice(2) : digits;

  // Country code 92 + 10 digit mobile -> local 0 wali shakal
  if (rest.startsWith("92") && rest.length === 12) {
    rest = `0${rest.slice(2)}`;
  }

  // Leading 0 ke bagair likha hua mobile: 3001234567 -> 03001234567
  if (rest.length === 10 && rest.startsWith("3")) {
    rest = `0${rest}`;
  }

  return rest;
};

// In providers par local part ke dots ka koi matlab nahi hota aur "+" ke baad
// wala hissa sirf tagging hai, mail wahi inbox mein girti hai.
const DOT_AND_PLUS_PROVIDERS = new Set(["gmail.com", "googlemail.com"]);

/**
 * Email ko canonical shakal mein laata hai.
 *
 * ali.khan@gmail.com, alikhan@gmail.com aur ali+shop@gmail.com teeno EK HI
 * inbox hain, is liye gmail par dots aur +suffix hata dete hain.
 *
 * Baaki domains par sirf lowercase + trim karte hain. Aggressive hona yahan
 * khatarnak hai: har provider dots ko ignore nahi karta, aur do asli alag
 * customers ko ek samajh lena unke liye ghalat "coupon pehle istemal ho chuka"
 * wala message bana deta hai.
 */
export const normalizeEmail = (value) => {
  const trimmed = String(value || "").trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return trimmed || null;

  const at = trimmed.lastIndexOf("@");
  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);

  if (domain === "googlemail.com") domain = "gmail.com";

  if (DOT_AND_PLUS_PROVIDERS.has(domain)) {
    const plus = local.indexOf("+");
    if (plus !== -1) local = local.slice(0, plus);
    local = local.replace(/\./g, "");
  }

  if (!local) return trimmed;
  return `${local}@${domain}`;
};

/** Coupon code hamesha UPPERCASE, bina spaces ke. */
export const normalizeCouponCode = (value) =>
  String(value || "").trim().toUpperCase().replace(/\s+/g, "");
