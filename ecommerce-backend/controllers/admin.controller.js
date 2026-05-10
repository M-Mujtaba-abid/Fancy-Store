import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Yahan hum Sequelize ka .count() use kar rahe hain
  const [totalUsers, totalProducts, totalOrders, totalReviews] = await Promise.all([
    User.count(),    
    Product.count(), 
    Order.count(),
    Review.count()
  ]);

  res.status(200).json(
    new ApiResponse(200, { totalUsers, totalProducts, totalOrders, totalReviews }, "Stats fetched successfully")
  );
});
