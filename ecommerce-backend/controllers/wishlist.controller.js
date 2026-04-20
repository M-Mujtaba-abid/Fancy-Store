import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  toggleWishlistService,
  getWishlistService,
} from "../services/wishlist.service.js";

// ============== TOGGLE ==============
export const toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) throw new ApiError(400, "Product ID is required");

  const data = await toggleWishlistService(userId, productId);
  res.status(200).json(new ApiResponse(200, data, data.message));
});

// ============== GET WISHLIST ==============
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const items = await getWishlistService(userId);
  res.status(200).json(new ApiResponse(200, items, "Wishlist fetched"));
});