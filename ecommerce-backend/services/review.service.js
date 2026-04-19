import models from "../models/index.js";
const { Review, User, Product, Order, OrderItem } = models;
import ApiError from "../utils/apiError.js";
import cloudinary from "../utils/cloudinary.js";
import { Op } from "sequelize";

// ============== CLOUDINARY UPLOAD ==============
const uploadImagesToCloudinary = (files) => {
  return Promise.all(
    files.map((file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "reviews" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      })
    )
  );
};

// ============== ADD REVIEW ==============
export const addReviewService = async (userId, productId, rating, comment, files) => {

  const orders = await Order.findAll({
    where: { userId, status: "delivered" },
  });

  if (!orders || orders.length === 0) {
    throw new ApiError(403, "You can only review products you have purchased");
  }

  const orderIds = orders.map(o => o.id);

  const orderItem = await OrderItem.findOne({
    where: {
      orderId: { [Op.in]: orderIds },
      productId: Number(productId),
    },
  });

  if (!orderItem) {
    throw new ApiError(403, "You can only review products you have purchased");
  }

  const existing = await Review.findOne({ where: { userId, productId } });
  if (existing) throw new ApiError(400, "You have already reviewed this product");

  let images = [];
  if (files && files.length > 0) {
    images = await uploadImagesToCloudinary(files);
  }

  const review = await Review.create({ userId, productId, rating, comment, images });
  return review;
};

// ============== GET PRODUCT REVIEWS ==============
export const getProductReviewsService = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const reviews = await Review.findAll({
    where: { productId },
    include: [{ model: User, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return { avgRating, totalReviews: reviews.length, reviews };
};

// ============== UPDATE REVIEW ==============
export const updateReviewService = async (reviewId, userId, rating, comment, files) => {
  const review = await Review.findOne({ where: { id: reviewId, userId } });
  if (!review) throw new ApiError(404, "Review not found or not authorized");

  if (files && files.length > 0) {
    review.images = await uploadImagesToCloudinary(files);
  }

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;

  await review.save();
  return review;
};

// ============== DELETE REVIEW ==============
export const deleteReviewService = async (reviewId, userId, role) => {
  const where = role === "admin" ? { id: reviewId } : { id: reviewId, userId };
  const review = await Review.findOne({ where });
  if (!review) throw new ApiError(404, "Review not found or not authorized");

  await review.destroy();
};

// ============== ADMIN REPLY ==============
export const adminReplyService = async (reviewId, reply) => {
  const review = await Review.findByPk(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  review.adminReply = reply;
  await review.save();
  return review;
};