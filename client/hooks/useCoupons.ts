import { couponService } from "@/service/couponService/coupon.service";
import type { CouponMutationInput } from "@/types/coupon.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

/**
 * Backend ke messages customer/admin ke liye likhe gaye hain ("This coupon has
 * reached its usage limit", "Deleting it would erase that sales history"), is
 * liye unhe generic text se badalna nuqsan deh hai.
 */
const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

export const useCoupons = () =>
  useQuery({
    queryKey: ["coupons"],
    queryFn: () => couponService.getAll(),
  });

export const useCouponReport = (id?: number) =>
  useQuery({
    queryKey: ["coupons", "report", id],
    queryFn: () => couponService.getReport(id!),
    enabled: !!id,
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponMutationInput) => couponService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not create coupon")),
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CouponMutationInput> }) =>
      couponService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update coupon")),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => couponService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted");
    },
    // Istemal shuda coupon delete karne par backend rok deta hai aur wajah
    // batata hai (sale history mit jati). Wo message dikhana zaroori hai.
    onError: (error) => toast.error(errorMessage(error, "Could not delete coupon")),
  });
};

export const useReleaseRedemption = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      couponService.releaseRedemption(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Customer can use this coupon again");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not release")),
  });
};
