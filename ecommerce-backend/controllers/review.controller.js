import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js"; // Ensure this is imported
import {
  addReviewService,
  getProductReviewsService,
  updateReviewService,
  deleteReviewService,
  adminReplyService,
  approveReviewService,
  getPendingReviewsService, // Naya service import
} from "../services/review.service.js";

// ============== ADD REVIEW ==============
export const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    throw new ApiError(400, "Product ID aur rating lazmi hain");
  }

  const review = await addReviewService(userId, productId, rating, comment, req.files);
  
  // User ko bata den ke review pending hai
  res.status(201).json(
    new ApiResponse(201, review, "Review submit ho gya hai, admin approval ke baad show hoga")
  );
});

// ============== GET PRODUCT REVIEWS (Public) ==============
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = await getProductReviewsService(productId);
  res.status(200).json(new ApiResponse(200, data, "Reviews fetched successfully"));
});

// ============== ADMIN: APPROVE REVIEW (The Tick Mark) ==============
export const approveReview = asyncHandler(async (req, res) => {
  const { id } = req.params; // Review ID

  const review = await approveReviewService(id);
  res.status(200).json(new ApiResponse(200, review, "Review approve ho gya aur rating update ho gayi"));
});

// ============== ADMIN: REPLY TO REVIEW ==============
export const adminReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) throw new ApiError(400, "Reply text is required");

  const review = await adminReplyService(id, reply);
  res.status(200).json(new ApiResponse(200, review, "Admin reply added successfully"));
});

// controllers/review.controller.js mein add karein:
export const getPendingReviews = asyncHandler(async (req, res) => {
  // Service call to get reviews with isApproved: false
  const reviews = await getPendingReviewsService();
  
  res.status(200).json(
    new ApiResponse(200, reviews, "Pending reviews fetched successfully")
  );
});

// ============== UPDATE REVIEW ==============
export const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await updateReviewService(id, userId, rating, comment, req.files);
  res.status(200).json(new ApiResponse(200, review, "Review update ho gya hai"));
});

// ============== DELETE REVIEW ==============
export const deleteReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { id } = req.params;

  await deleteReviewService(id, userId, role);
  res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
});