import models from "../models/index.js";
const { Wishlist, Product } = models;
import ApiError from "../utils/apiError.js";

// ============== TOGGLE WISHLIST ==============
export const toggleWishlistService = async (userId, productId) => {
  // Product exist karta hai?
  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Pehle se wishlist mein hai?
  const existing = await Wishlist.findOne({ where: { userId, productId } });

  if (existing) {
    await existing.destroy();
    return { added: false, message: "Removed from wishlist" };
  }

  await Wishlist.create({ userId, productId });
  return { added: true, message: "Added to wishlist" };
};

// ============== GET WISHLIST ==============
export const getWishlistService = async (userId) => {
  const items = await Wishlist.findAll({
    where: { userId },
    include: [{ model: Product }],
    order: [["createdAt", "DESC"]],
  });

  return items;
};