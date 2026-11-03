import StoreSetting from "../models/storeSetting.model.js";
import Coupon from "../models/coupon.model.js";
import ApiError from "../utils/apiError.js";
import { SHIPPING_FEE } from "../constants/index.js";
import { normalizeCouponCode } from "../utils/contact.util.js";

/**
 * Store-wide settings jo admin panel (/dashboard/settings) se badalti hain.
 *
 * ⚠️ Delivery charge ka EK hi source yahi hai. Cart aur order dono
 * getShippingFee() se lete hain, constants/index.js ka SHIPPING_FEE sirf tab
 * kaam aata hai jab DB mein row hi na ho (fresh database, ya migration abhi
 * chali na ho).
 *
 * Har read seedha DB se hota hai, cache nahi: ye primary key lookup hai, aur
 * admin ke "free delivery" karte hi agla order usi waqt naye charge par lagna
 * chahiye. Serverless par in-memory cache har instance mein alag hota, to kuch
 * orders purane charge par chale jate.
 */

const MAX_SHIPPING_FEE = 5000;

const DEFAULTS = {
  shippingFee: SHIPPING_FEE,
  sale: {
    enabled: false,
    headline: "Up to 40% OFF",
    // 11 Nov raat 11:59 PKT. UTC mein store hota hai, client apne time zone
    // mein countdown dikhata hai.
    endsAt: "2026-11-11T18:59:59.000Z",
    // Khali = popup mein koi code nahi dikhta. Bharne par wo code
    // Coupons mein mojood aur active hona chahiye.
    couponCode: "",
  },
};

/**
 * ⚠️ Table na ho (migration abhi nahi chali) to default lo, error nahi.
 * Warna code deploy hote hi har cart aur har order 500 dene lagta.
 * Transaction ke andar ye fallback kaam nahi karta (Postgres poori transaction
 * abort kar deta hai), is liye order.service isay transaction ke bahar bulata hai.
 */
const readKey = async (key, transaction) => {
  try {
    const row = await StoreSetting.findByPk(key, { transaction });
    return row ? row.value : undefined;
  } catch (error) {
    if (!transaction && error?.parent?.code === "42P01") return undefined;
    throw error;
  }
};

const writeKey = (key, value, transaction) =>
  StoreSetting.upsert({ key, value }, { transaction });

/** Cart aur order isi se delivery charge lete hain. */
export const getShippingFee = async (transaction) => {
  const value = await readKey("shippingFee", transaction);
  const fee = Number(value);
  return Number.isFinite(fee) && fee >= 0 ? fee : DEFAULTS.shippingFee;
};

const getSale = async () => ({
  ...DEFAULTS.sale,
  ...((await readKey("sale")) || {}),
});

/** Public: storefront ka popup, strip aur cart sab yahi parhte hain. */
export const getSettingsService = async () => ({
  shippingFee: await getShippingFee(),
  sale: await getSale(),
});

const validateShippingFee = (raw) => {
  const fee = Number(raw);
  if (raw === "" || raw === null || !Number.isFinite(fee) || fee < 0 || fee > MAX_SHIPPING_FEE) {
    throw new ApiError(400, `Delivery charge must be between 0 and ${MAX_SHIPPING_FEE}.`);
  }
  return Math.round(fee);
};

const validateSale = async (raw, current) => {
  const next = { ...current };

  if (raw.enabled !== undefined) next.enabled = Boolean(raw.enabled);

  if (raw.headline !== undefined) {
    const headline = String(raw.headline || "").trim();
    if (!headline || headline.length > 40) {
      throw new ApiError(400, "Sale headline must be 1 to 40 characters.");
    }
    next.headline = headline;
  }

  if (raw.endsAt !== undefined) {
    const endsAt = new Date(raw.endsAt);
    if (Number.isNaN(endsAt.getTime())) throw new ApiError(400, "Sale end date is not valid.");
    next.endsAt = endsAt.toISOString();
  }

  if (raw.couponCode !== undefined) {
    const code = normalizeCouponCode(raw.couponCode);
    if (code) {
      // Popup mein aisa code dikhana jo checkout par reject ho jaye, customer
      // ka bharosa todta hai. Is liye save hi nahi hone dete.
      const coupon = await Coupon.findOne({ where: { code } });
      if (!coupon) throw new ApiError(400, `Coupon "${code}" does not exist. Create it on the Coupons page first.`);
      if (!coupon.isActive) throw new ApiError(400, `Coupon "${code}" is not active.`);
    }
    next.couponCode = code;
  }

  return next;
};

/** Admin: sirf jo fields bheji jayen wahi badalti hain. */
export const updateSettingsService = async (body = {}) => {
  if (body.shippingFee !== undefined) {
    await writeKey("shippingFee", validateShippingFee(body.shippingFee));
  }

  if (body.sale && typeof body.sale === "object") {
    await writeKey("sale", await validateSale(body.sale, await getSale()));
  }

  return getSettingsService();
};
