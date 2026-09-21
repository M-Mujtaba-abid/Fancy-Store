export type DiscountType = "percent" | "fixed";
export type RedemptionStatus = "consumed" | "released";

export interface Coupon {
  id: number;
  code: string;
  ownerName: string;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  discountType: DiscountType;
  discountValue: number;
  /** Percent coupons ka cap. null = koi cap nahi. */
  maxDiscount?: number | null;
  minOrderAmount: number;
  /** null = unlimited. */
  usageLimit?: number | null;
  usedCount: number;
  usageLimitPerCustomer: number;
  /** Bhare hue hon to coupon sirf usi customer ke liye. */
  restrictToPhone?: string | null;
  restrictToEmail?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  /** Sirf report ke liye, order ke total par asar nahi. */
  commissionPercent: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** List endpoint har coupon ke sath uski sale ka khulasa bhi deta hai. */
export interface CouponWithStats extends Coupon {
  orders: number;
  sales: number;
  totalDiscount: number;
  commissionDue: number;
}

export interface CouponRedemption {
  id: number;
  couponId: number;
  orderId?: number | null;
  userId?: number | null;
  phone?: string | null;
  email?: string | null;
  discountAmount: number;
  orderSubtotal: number;
  status: RedemptionStatus;
  releasedAt?: string | null;
  releaseReason?: string | null;
  createdAt: string;
  order?: {
    id: number;
    status: string;
    subtotal: number;
    totalAmount: number;
    fullName: string;
    createdAt: string;
  } | null;
}

export interface CouponReport {
  coupon: Coupon;
  redemptions: CouponRedemption[];
  summary: {
    orders: number;
    sales: number;
    totalDiscount: number;
    commissionDue: number;
  };
}

/**
 * Checkout par validate endpoint ka jawab.
 *
 * ⚠️ `discountAmount` sirf DIKHANE ke liye hai. Order ka asal discount server
 * apni transaction ke andar dobara nikalta hai, client ka bheja hua amount
 * kahin istemal nahi hota.
 */
export interface AppliedCoupon {
  code: string;
  ownerName: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  minOrderAmount: number;
}

export interface CouponMutationInput {
  code: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number | string | null;
  minOrderAmount?: number;
  usageLimit?: number | string | null;
  usageLimitPerCustomer?: number;
  restrictToPhone?: string;
  restrictToEmail?: string;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
  commissionPercent?: number;
  notes?: string;
}
