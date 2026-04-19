import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  addReviewService,
  getProductReviewsService,
  updateReviewService,
  deleteReviewService,
  adminReplyService,
} from "../services/review.service.js";

// ============== ADD REVIEW ==============
export const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    throw new ApiError(400, "Product ID and rating are required");
  }

  const review = await addReviewService(userId, productId, rating, comment, req.files);
  res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

// ============== GET PRODUCT REVIEWS ==============
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = await getProductReviewsService(productId);
  res.status(200).json(new ApiResponse(200, data, "Reviews fetched successfully"));
});

// ============== UPDATE REVIEW ==============
export const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await updateReviewService(id, userId, rating, comment, req.files);
  res.status(200).json(new ApiResponse(200, review, "Review updated successfully"));
});

// ============== DELETE REVIEW ==============
export const deleteReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { id } = req.params;

  await deleteReviewService(id, userId, role);
  res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
});
export const adminReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) throw new ApiError(400, "Reply is required");

  const review = await adminReplyService(id, reply);
  res.status(200).json(new ApiResponse(200, review, "Reply added successfully"));
});