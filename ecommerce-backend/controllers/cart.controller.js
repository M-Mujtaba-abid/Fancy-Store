
import models from "../models/index.js";
const { Cart, CartItem, Product } = models;
// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware se aaya
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product ID and quantity required" });
    }

    // Check if cart exists for user
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if product already in cart
    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    return res.status(200).json({ message: "Product added to cart", cartItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update quantity / remove product
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.status(200).json({ message: "Item removed from cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({ message: "Cart updated", cartItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get cart items
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product }],
    });

    return res.status(200).json({ cartId: cart.id, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
