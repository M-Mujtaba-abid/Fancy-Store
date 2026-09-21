import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Coupon from "../models/coupon.model.js";
import CouponRedemption from "../models/couponRedemption.model.js";
import Order from "../models/order.model.js";
import ApiError from "../utils/apiError.js";
import {
  normalizeCouponCode,
  normalizeEmail,
  normalizePhone,
} from "../utils/contact.util.js";

// ============================================================
// DISCOUNT KA HISAAB
// ============================================================

/**
 * Discount SIRF items ke subtotal par lagta hai, shipping par nahi.
 *
 * Shipping flat Rs 299 hai (constants/index.js). Agar discount us par bhi lag
 * jaye to store apni delivery cost par bhi chhoot de raha hota hai.
 */
export const computeDiscount = (coupon, subtotal) => {
  if (!subtotal || subtotal <= 0) return 0;

  let discount =
    coupon.discountType === "percent"
      ? (Number(subtotal) * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);

  if (coupon.maxDiscount != null && Number(coupon.maxDiscount) > 0) {
    discount = Math.min(discount, Number(coupon.maxDiscount));
  }

  // Discount kabhi subtotal se zyada na ho. Fixed coupon (e.g. Rs 500) chhote
  // order par laga to total manfi ho jata, aur shipping bhi muft ho jati.
  discount = Math.min(discount, Number(subtotal));

  // Rupees mein round. Paise is store mein kahin nahi dikhte.
  return Math.max(0, Math.round(discount));
};

// ============================================================
// VALIDATION
// ============================================================

/**
 * Wo checks jinke liye redemption history ki zaroorat nahi.
 * Preview aur asal order, dono jagah yehi chalte hain.
 */
const assertCouponUsable = (coupon, subtotal) => {
  if (!coupon) throw new ApiError(404, "This coupon code is not valid.");
  if (!coupon.isActive) throw new ApiError(400, "This coupon is no longer active.");

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    throw new ApiError(400, "This coupon is not active yet.");
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    throw new ApiError(400, "This coupon has expired.");
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit.");
  }

  if (Number(subtotal) < Number(coupon.minOrderAmount || 0)) {
    throw new ApiError(
      400,
      `This coupon needs a minimum order of Rs. ${Number(coupon.minOrderAmount).toLocaleString()}.`
    );
  }
};

/**
 * Personal coupon: sirf usi phone/email ke liye jo coupon par likha hai.
 * Khali fields ka matlab coupon sab ke liye khula hai.
 */
const assertCustomerAllowed = (coupon, phoneNormalized, emailNormalized) => {
  const restrictedPhone = coupon.restrictToPhone;
  const restrictedEmail = coupon.restrictToEmail;
  if (!restrictedPhone && !restrictedEmail) return;

  const phoneOk = restrictedPhone && restrictedPhone === phoneNormalized;
  const emailOk = restrictedEmail && restrictedEmail === emailNormalized;

  // Dono mein se koi ek mil jaye to kaafi. Aksar admin sirf phone bharta hai.
  if (!phoneOk && !emailOk) {
    throw new ApiError(400, "This coupon is reserved for a different customer.");
  }
};

/**
 * Per-customer limit.
 *
 * phone YA email, dono mein se koi bhi pehle istemal ho chuka ho to rok do.
 * `AND` rakhne se banda sirf email badal kar dobara le leta.
 *
 * NOTE: ye sirf pehla darwaza hai. Asal rok database ke partial unique indexes
 * hain (migration 20260921090100), kyunke do orders ek sath aayein to yahan
 * dono ka count 0 aa sakta hai.
 */
const assertNotAlreadyUsed = async (
  coupon,
  { phoneNormalized, emailNormalized, transaction }
) => {
  const orConditions = [];
  if (phoneNormalized) orConditions.push({ phoneNormalized });
  if (emailNormalized) orConditions.push({ emailNormalized });
  if (orConditions.length === 0) return;

  const used = await CouponRedemption.count({
    where: {
      couponId: coupon.id,
      status: "consumed",
      [Op.or]: orConditions,
    },
    transaction,
  });

  if (used >= Number(coupon.usageLimitPerCustomer || 1)) {
    throw new ApiError(400, "You have already used this coupon.");
  }
};

const findByCode = (code, options = {}) =>
  Coupon.findOne({ where: { code: normalizeCouponCode(code) }, ...options });

/**
 * Checkout par "code sahi hai ya nahi" dikhane ke liye. Read only.
 *
 * ⚠️ Is ka natija order ke total ke liye AUTHORITATIVE nahi hai. Client jo
 * discount bheje us par kabhi bharosa mat karo - asal discount
 * applyCouponForOrder order wali transaction ke andar dobara nikalta hai.
 */
export const previewCouponService = async ({ code, subtotal, phone, email }) => {
  if (!code) throw new ApiError(400, "Please enter a coupon code.");

  const coupon = await findByCode(code);
  assertCouponUsable(coupon, subtotal);

  const phoneNormalized = normalizePhone(phone);
  const emailNormalized = normalizeEmail(email);

  assertCustomerAllowed(coupon, phoneNormalized, emailNormalized);

  // Contact diya ho to abhi bata dete hain ke pehle istemal ho chuka hai,
  // taake customer ko order ke aakhir mein surprise na mile.
  if (phoneNormalized || emailNormalized) {
    await assertNotAlreadyUsed(coupon, { phoneNormalized, emailNormalized });
  }

  const discountAmount = computeDiscount(coupon, subtotal);

  return {
    code: coupon.code,
    ownerName: coupon.ownerName,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    minOrderAmount: coupon.minOrderAmount,
  };
};

// ============================================================
// ORDER KE ANDAR LAGANA
// ============================================================

/**
 * Order ki transaction ke andar coupon lock kar ke validate karta hai.
 *
 * Row lock zaroori hai: lock ke bagair do orders ek sath aa kar dono usedCount
 * parh lete hain, dono badha dete hain, aur usageLimit se zyada redeem ho jata
 * hai.
 *
 * Coupon na mile ya na chale to error phenka jata hai, chup chaap ignore nahi
 * karte: customer ne checkout par discount dekha tha, us ke bina order lagana
 * uske sath dhoka hoga.
 */
export const applyCouponForOrder = async ({
  code,
  subtotal,
  phone,
  email,
  transaction,
}) => {
  if (!code) return { coupon: null, discountAmount: 0 };

  const coupon = await findByCode(code, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const phoneNormalized = normalizePhone(phone);
  const emailNormalized = normalizeEmail(email);

  assertCouponUsable(coupon, subtotal);
  assertCustomerAllowed(coupon, phoneNormalized, emailNormalized);
  await assertNotAlreadyUsed(coupon, {
    phoneNormalized,
    emailNormalized,
    transaction,
  });

  const discountAmount = computeDiscount(coupon, subtotal);

  return { coupon, discountAmount, phoneNormalized, emailNormalized };
};

/**
 * Redemption row banata hai aur usedCount barhata hai.
 *
 * Unique index violation ko saaf message mein badalte hain: wo tabhi lagta hai
 * jab do orders ek sath aaye hon aur ye doosra ho.
 */
export const recordRedemption = async ({
  coupon,
  orderId,
  userId,
  phone,
  email,
  phoneNormalized,
  emailNormalized,
  discountAmount,
  orderSubtotal,
  transaction,
}) => {
  try {
    await CouponRedemption.create(
      {
        couponId: coupon.id,
        orderId,
        userId: userId ?? null,
        phone: phone ?? null,
        email: email ?? null,
        phoneNormalized: phoneNormalized ?? null,
        emailNormalized: emailNormalized ?? null,
        discountAmount,
        orderSubtotal,
        status: "consumed",
      },
      { transaction }
    );
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      throw new ApiError(400, "You have already used this coupon.");
    }
    throw error;
  }

  await coupon.increment("usedCount", { by: 1, transaction });
};

/**
 * Order cancel ho jaye to coupon customer ke liye dobara khol dete hain.
 *
 * `returned` par jaan bujh kar release NAHI karte: wahan customer ko maal aur
 * discount dono mil chuke hote hain. Admin chahe to panel se haath se release
 * kar sakta hai.
 */
export const releaseRedemptionsForOrder = async (
  orderId,
  reason = "Order cancelled",
  transaction = null
) => {
  const [count] = await CouponRedemption.update(
    { status: "released", releasedAt: new Date(), releaseReason: reason },
    { where: { orderId, status: "consumed" }, transaction }
  );

  // usedCount wapas kam karo, warna cancel hue orders bhi usage limit khate
  // rehte hain.
  if (count > 0) {
    const rows = await CouponRedemption.findAll({
      where: { orderId },
      attributes: ["couponId"],
      transaction,
    });
    for (const row of rows) {
      await Coupon.decrement("usedCount", {
        by: 1,
        where: { id: row.couponId, usedCount: { [Op.gt]: 0 } },
        transaction,
      });
    }
  }

  return count;
};

// ============================================================
// ADMIN CRUD
// ============================================================

const toNullableNumber = (value) =>
  value === "" || value === null || value === undefined ? null : Number(value);

const buildCouponPayload = (body) => {
  const code = normalizeCouponCode(body.code);
  if (!code) throw new ApiError(400, "Coupon code is required.");
  if (!String(body.ownerName || "").trim()) {
    throw new ApiError(400, "Owner name is required.");
  }

  const discountType = body.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new ApiError(400, "Discount value must be greater than 0.");
  }
  if (discountType === "percent" && discountValue > 100) {
    throw new ApiError(400, "Percent discount cannot be more than 100.");
  }

  return {
    code,
    ownerName: String(body.ownerName).trim(),
    ownerPhone: body.ownerPhone ? String(body.ownerPhone).trim() : null,
    ownerEmail: body.ownerEmail ? String(body.ownerEmail).trim() : null,
    discountType,
    discountValue,
    maxDiscount: toNullableNumber(body.maxDiscount),
    minOrderAmount: Number(body.minOrderAmount) || 0,
    usageLimit: toNullableNumber(body.usageLimit),
    usageLimitPerCustomer: Number(body.usageLimitPerCustomer) || 1,
    // Restrictions normalized shakal mein hi rakhte hain, warna admin "+92 300
    // 1234567" likhe aur customer "03001234567" to match hi na ho.
    restrictToPhone: normalizePhone(body.restrictToPhone),
    restrictToEmail: normalizeEmail(body.restrictToEmail),
    startsAt: body.startsAt || null,
    expiresAt: body.expiresAt || null,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    commissionPercent: Number(body.commissionPercent) || 0,
    notes: body.notes ? String(body.notes) : null,
  };
};

/** Har coupon ke sath uski sale ka khulasa. */
export const listCouponsService = async () => {
  const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]] });

  const stats = await CouponRedemption.findAll({
    attributes: [
      "couponId",
      [sequelize.fn("COUNT", sequelize.col("id")), "orders"],
      [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("orderSubtotal")), 0), "sales"],
      [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("discountAmount")), 0), "discount"],
    ],
    where: { status: "consumed" },
    group: ["couponId"],
    raw: true,
  });

  const byId = new Map(stats.map((s) => [Number(s.couponId), s]));

  return coupons.map((coupon) => {
    const stat = byId.get(coupon.id) || {};
    const sales = Number(stat.sales || 0);
    return {
      ...coupon.toJSON(),
      orders: Number(stat.orders || 0),
      sales,
      totalDiscount: Number(stat.discount || 0),
      commissionDue: Math.round((sales * Number(coupon.commissionPercent || 0)) / 100),
    };
  });
};

/** Ek coupon ki tafseel + uski saari redemptions (admin report screen). */
export const getCouponReportService = async (id) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) throw new ApiError(404, "Coupon not found.");

  const redemptions = await CouponRedemption.findAll({
    where: { couponId: id },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Order,
        as: "order",
        attributes: ["id", "status", "subtotal", "totalAmount", "fullName", "createdAt"],
        required: false,
      },
    ],
  });

  const consumed = redemptions.filter((r) => r.status === "consumed");
  const sales = consumed.reduce((sum, r) => sum + Number(r.orderSubtotal || 0), 0);

  return {
    coupon: coupon.toJSON(),
    redemptions,
    summary: {
      orders: consumed.length,
      sales,
      totalDiscount: consumed.reduce((sum, r) => sum + Number(r.discountAmount || 0), 0),
      commissionDue: Math.round((sales * Number(coupon.commissionPercent || 0)) / 100),
    },
  };
};

export const createCouponService = async (body) => {
  const payload = buildCouponPayload(body);

  const existing = await findByCode(payload.code);
  if (existing) throw new ApiError(409, "A coupon with this code already exists.");

  return Coupon.create(payload);
};

export const updateCouponService = async (id, body) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) throw new ApiError(404, "Coupon not found.");

  const payload = buildCouponPayload({ ...coupon.toJSON(), ...body });

  if (payload.code !== coupon.code) {
    const clash = await findByCode(payload.code);
    if (clash) throw new ApiError(409, "A coupon with this code already exists.");
  }

  // usedCount kabhi body se set nahi hota - wo sirf asal redemptions se badhta
  // hai, warna admin galti se report kharab kar sakta hai.
  await coupon.update(payload);
  return coupon;
};

/**
 * Delete se pehle rokte hain agar coupon istemal ho chuka ho.
 *
 * CouponRedemptions par CASCADE laga hua hai, to delete karne se us promoter
 * ki poori sale history bhi mit jati. Aise coupon ko band karne ka sahi tareeqa
 * isActive = false hai.
 */
export const deleteCouponService = async (id) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) throw new ApiError(404, "Coupon not found.");

  const used = await CouponRedemption.count({ where: { couponId: id } });
  if (used > 0) {
    throw new ApiError(
      400,
      `This coupon has ${used} recorded order(s). Deleting it would erase that sales history. Turn it off instead.`
    );
  }

  await coupon.destroy();
  return { id: Number(id) };
};

/** Admin ka manual release (customer ki wajib shikayat par). */
export const releaseRedemptionService = async (redemptionId, reason) => {
  const redemption = await CouponRedemption.findByPk(redemptionId);
  if (!redemption) throw new ApiError(404, "Redemption not found.");
  if (redemption.status === "released") return redemption;

  await sequelize.transaction(async (transaction) => {
    await redemption.update(
      {
        status: "released",
        releasedAt: new Date(),
        releaseReason: reason || "Released by admin",
      },
      { transaction }
    );
    await Coupon.decrement("usedCount", {
      by: 1,
      where: { id: redemption.couponId, usedCount: { [Op.gt]: 0 } },
      transaction,
    });
  });

  return redemption;
};
