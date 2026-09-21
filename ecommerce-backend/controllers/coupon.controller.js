import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  createCouponService,
  deleteCouponService,
  getCouponReportService,
  listCouponsService,
  previewCouponService,
  releaseRedemptionService,
  updateCouponService,
} from "../services/coupon.service.js";

// POST /api/coupons/validate — public (checkout par code check karne ke liye)
//
// ⚠️ Ye sirf UI ke liye hai. Jo discount yahan se milta hai usay order ke total
// ka faisla mat samjho: asal discount placeOrderService apni transaction ke
// andar dobara nikalta hai. Client ka bheja hua amount kahin istemal nahi hota.
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, phone, email } = req.body;
  const data = await previewCouponService({
    code,
    subtotal: Number(subtotal) || 0,
    phone,
    email,
  });
  res.status(200).json(new ApiResponse(200, data, "Coupon applied"));
});

// GET /api/coupons — admin
export const getCoupons = asyncHandler(async (req, res) => {
  const data = await listCouponsService();
  res.status(200).json(new ApiResponse(200, data, "Coupons fetched"));
});

// GET /api/coupons/:id/report — admin (promoter ki sale report)
export const getCouponReport = asyncHandler(async (req, res) => {
  const data = await getCouponReportService(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Coupon report fetched"));
});

// POST /api/coupons — admin
export const createCoupon = asyncHandler(async (req, res) => {
  const data = await createCouponService(req.body);
  res.status(201).json(new ApiResponse(201, data, "Coupon created"));
});

// PATCH /api/coupons/:id — admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const data = await updateCouponService(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, data, "Coupon updated"));
});

// DELETE /api/coupons/:id — admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const data = await deleteCouponService(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Coupon deleted"));
});

// PATCH /api/coupons/redemptions/:id/release — admin
export const releaseRedemption = asyncHandler(async (req, res) => {
  const data = await releaseRedemptionService(req.params.id, req.body?.reason);
  res.status(200).json(new ApiResponse(200, data, "Redemption released"));
});
