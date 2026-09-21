import type { ApiResponse } from "@/types/product.type";
import type {
  AppliedCoupon,
  Coupon,
  CouponMutationInput,
  CouponReport,
  CouponWithStats,
} from "@/types/coupon.type";
import api from "../api";

/**
 * Promoter ke link se aaya hua code yahan rakha jata hai.
 *
 * Wajah: influencer coupon programs ki sab se bari leak ye hai ke customer
 * code type karna bhool jata hai. Link (?ref=CODE) se aane par hum code khud
 * yaad rakh lete hain aur checkout par pehle se bhar dete hain.
 */
const REF_STORAGE_KEY = "fs_ref_coupon";

export const couponStorage = {
  save(code: string) {
    try {
      localStorage.setItem(REF_STORAGE_KEY, code.trim().toUpperCase());
    } catch {
      // Private window ya storage band. Coupon manually bhi daala ja sakta hai,
      // is liye chup chaap chhor dete hain.
    }
  },
  read(): string {
    try {
      return localStorage.getItem(REF_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  },
  clear() {
    try {
      localStorage.removeItem(REF_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

export const couponService = {
  /**
   * Checkout par code check karne ke liye.
   *
   * phone aur email jaan bujh kar bheje jate hain: server abhi bata deta hai
   * ke is customer ne coupon pehle istemal to nahi kiya, taake order ke aakhir
   * mein surprise na mile.
   */
  validate: async (payload: {
    code: string;
    subtotal: number;
    phone?: string;
    email?: string;
  }): Promise<AppliedCoupon> => {
    const res = await api.post<ApiResponse<AppliedCoupon>>(
      "/coupons/validate",
      payload
    );
    return res.data.data;
  },

  // --- Admin ---

  getAll: async (): Promise<CouponWithStats[]> => {
    const res = await api.get<ApiResponse<CouponWithStats[]>>("/coupons");
    return Array.isArray(res.data.data) ? res.data.data : [];
  },

  getReport: async (id: number): Promise<CouponReport> => {
    const res = await api.get<ApiResponse<CouponReport>>(`/coupons/${id}/report`);
    return res.data.data;
  },

  create: async (payload: CouponMutationInput): Promise<Coupon> => {
    const res = await api.post<ApiResponse<Coupon>>("/coupons", payload);
    return res.data.data;
  },

  update: async (id: number, payload: Partial<CouponMutationInput>): Promise<Coupon> => {
    const res = await api.patch<ApiResponse<Coupon>>(`/coupons/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: number) => {
    const res = await api.delete<ApiResponse<{ id: number }>>(`/coupons/${id}`);
    return res.data.data;
  },

  releaseRedemption: async (redemptionId: number, reason?: string) => {
    const res = await api.patch<ApiResponse<unknown>>(
      `/coupons/redemptions/${redemptionId}/release`,
      { reason }
    );
    return res.data.data;
  },
};
