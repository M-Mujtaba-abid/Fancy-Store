import {
  addToCartService,
  updateCartItemService,
  getCartService,
  clearCartService
} from "../services/cart.service.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: "Valid Product ID and quantity are required" });
    }

    const cartItem = await addToCartService(userId, productId, quantity);
    return res.status(200).json({ success: true, message: "Product added to cart", cartItem });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cartItem = await updateCartItemService(userId, productId, quantity);

    const message = cartItem ? "Cart updated" : "Item removed from cart";
    return res.status(200).json({ success: true, message, cartItem });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartData = await getCartService(userId);
    return res.status(200).json({ success: true, ...cartData });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await clearCartService(userId);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};