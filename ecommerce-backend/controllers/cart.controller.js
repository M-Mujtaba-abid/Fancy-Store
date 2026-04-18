import models from "../models/index.js";

const { Cart, CartItem, Product } = models;

// 1. Add product to cart (With Stock & Price Check)
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware se
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Valid Product ID and quantity are required" });
    }

    // Product and Stock Check
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Insufficient stock. Only ${product.stock} left.` });
    }

    // Find or Create Cart
    let [cart] = await Cart.findOrCreate({ where: { userId } });

    // Check if product already in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      const newTotalQuantity = cartItem.quantity + quantity;

      // Check total stock for cumulative quantity
      if (product.stock < newTotalQuantity) {
        return res.status(400).json({ message: "Out off stock" });
      }

      cartItem.quantity = newTotalQuantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cartItem,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// 2. Update quantity / remove product (With Stock Validation)
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
      include: [Product],
    });

    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    // Remove if quantity is 0 or less
    if (quantity <= 0) {
      await cartItem.destroy();
      return res
        .status(200)
        .json({ success: true, message: "Item removed from cart" });
    }

    // Verify stock before updating
    if (cartItem.Product.stock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for this update" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res
      .status(200)
      .json({ success: true, message: "Cart updated", cartItem });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// 3. Get cart items (With Subtotal & Discount Logic)
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: [
                "id",
                "name",
                "price",
                "discountPrice",
                "imageUrl",
                "stock",
              ],
            },
          ],
        },
      ],
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(200).json({
        success: true,
        items: [],
        subtotal: 0,
        message: "Cart is empty",
      });
    }

    let subtotal = 0;
    const formattedItems = cart.CartItems.map((item) => {
      // Professional Pricing: Agar sale hai to discountPrice uthayega
      const activePrice =
        item.Product.discountPrice && item.Product.discountPrice > 0
          ? item.Product.discountPrice
          : item.Product.price;

      const itemTotal = activePrice * item.quantity;
      subtotal += itemTotal;

      return {
        cartItemId: item.id,
        productId: item.Product.id,
        name: item.Product.name,
        image: item.Product.imageUrl,
        quantity: item.quantity,
        price: activePrice,
        itemTotal: parseFloat(itemTotal.toFixed(2)),
        availableStock: item.Product.stock,
      };
    });

    return res.status(200).json({
      success: true,
      cartId: cart.id,
      items: formattedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItems: formattedItems.length,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ where: { userId } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  res.status(200).json({ message: "Cart cleared" });
};
