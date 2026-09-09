/**
 * ==========================================
 * 🔍 SEO TEXT HELPERS
 * ==========================================
 * Title aur meta description ko Google ke display limits ke andar rakhne ke
 * liye. Dono jagah pehle asli masle the:
 *
 *  - Title mein "Fancy Store" DO dafa aa raha tha, kyunke app/layout.tsx ka
 *    `title.template` khud " | Fancy Store" jorta hai aur page bhi apni taraf
 *    se jor raha tha. Nateeja: 72 characters ka title jis mein 28 characters
 *    sirf brand ke naam ne kha liye.
 *
 *  - Description se HTML tags hatate waqt tag ki jagah kuch nahi rakha jata
 *    tha, to "...holds in wind.</p><p>Cut to the compact kei..." se
 *    "...holds in wind.Cut to the compact kei..." ban jata tha. Google
 *    results mein jumle chipke nazar aate the.
 */

/** Google title ko qareeban isi ke baad kaat deta hai. */
const TITLE_LIMIT = 60;

/** app/layout.tsx:81 ka template jo har title ke aakhir mein lagta hai. */
const BRAND_SUFFIX = " | Fancy Store";

/**
 * Pakistani buyers ka sab se aam search pattern. Jagah bache to title mein
 * shamil karte hain, warna gaari ka naam zyada ahem hai.
 */
const PRICE_KEYWORD = "Price in Pakistan";

/**
 * Product ke naam se marketing descriptor hata deta hai. Aksar naam
 * "Suzuki Alto Car Top Cover - Silver Parachute" ya "Premium Sportage Car
 * Cover | 100% waterproof" ki shakal mein hote hain, aur separator ke baad
 * wala hissa search ke liye qareeban bekaar hota hai.
 *
 * Agar pehla hissa bohot chhota nikle to poora naam wapas kar dete hain -
 * "Carry Daba silver - Suzuki Bolan Top Cover" par trim karne se gaari ka
 * naam hi ghayab ho jata tha.
 */
const coreProductName = (name: string): string => {
  const trimmed = String(name || "").trim();
  const core = trimmed.split(/\s[-–—|]\s/)[0].trim();
  return core.length >= 18 ? core : trimmed;
};

/** Word boundary par kaat kar diye gaye budget mein le aata hai. */
const fitToBudget = (text: string, budget: number): string => {
  if (text.length <= budget) return text;

  const cut = text.slice(0, budget);
  const lastSpace = cut.lastIndexOf(" ");
  // Aakhri space bohot shuru mein ho to kaatne se lafz hi nahi bachte,
  // aise mein seedha budget par kaat dete hain.
  const sliced = lastSpace > budget * 0.6 ? cut.slice(0, lastSpace) : cut;

  // Sirf kaate gaye text par safai: trailing separator ("... Top Cover -")
  // aur akela latka hua number/percent ("... Car Cover 100%") bhadda lagta
  // hai. Poore text par ye NAHI chalti (upar early return hai), warna
  // "Peugeot 206" jaisa asli number bhi kat jata.
  return sliced
    .replace(/[\s\-–—|,]+$/, "")
    .replace(/\s+\d+\s*%$/, "")
    .replace(/[\s\-–—|,]+$/, "")
    .trim();
};

/**
 * Product page ka `title`. Ismein brand suffix JAAN BOOJH KAR nahi lagate -
 * layout ka template wo khud jorta hai. Budget bhi usi hisab se rakha hai.
 */
export const buildProductTitle = (name: string): string => {
  const budget = TITLE_LIMIT - BRAND_SUFFIX.length;
  const core = coreProductName(name);
  const withKeyword = `${core} ${PRICE_KEYWORD}`;

  return withKeyword.length <= budget ? withKeyword : fitToBudget(core, budget);
};

/**
 * Product ki HTML description se saaf meta description banata hai.
 * Tag ki jagah space rakhte hain taake jumle na chipken.
 */
export const cleanMetaDescription = (
  html: string | null | undefined,
  fallback = "Buy premium car accessories at Fancy Store.",
  limit = 160
): string => {
  if (!html) return fallback;

  const text = String(html)
    .replace(/<[^>]+>/g, " ") // tag ki jagah space - yehi asal fix hai
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return fallback;

  return fitToBudget(text, limit);
};
