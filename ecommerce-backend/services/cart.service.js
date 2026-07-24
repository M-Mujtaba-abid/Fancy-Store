import models from "../models/index.js";
import { SHIPPING_FEE } from "../constants/index.js";
const { Cart, CartItem, Product } = models;

export const addToCartService = async (userId, productId, quantity, variantId = null) => {
  const normalizedVariantId = variantId ? Number(variantId) : null;

  // 1. Check if product exists and has stock
  const product = await Product.findByPk(productId);
  if (!product) throw { status: 404, message: "Product not found" };

  if (normalizedVariantId) {
    const variant = await models.ProductVariant.findOne({ where: { id: normalizedVariantId, productId } });
    if (!variant) throw { status: 404, message: "Variant not found" };
    if (variant.stock < quantity) {
      const vLabel = variant.variantValue || variant.materialName;
      throw { status: 400, message: `Insufficient stock. Only ${variant.stock} left for variant (${vLabel}).` };
    }
  } else {
    if (product.stock < quantity) {
      throw { status: 400, message: `Insufficient stock. Only ${product.stock} left.` };
    }
  }

  // 2. Find or Create Cart
  let [cart] = await Cart.findOrCreate({ where: { userId } });

  // 3. Check if item already in cart (matching both productId and variantId)
  let cartItem = await CartItem.findOne({
    where: {
      cartId: cart.id,
      productId,
      variantId: normalizedVariantId
    }
  });

  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    if (normalizedVariantId) {
      const variant = await models.ProductVariant.findByPk(normalizedVariantId);
      if (variant.stock < newQuantity) {
        throw { status: 400, message: "Total quantity exceeds available stock" };
      }
    } else {
      if (product.stock < newQuantity) {
        throw { status: 400, message: "Total quantity exceeds available stock" };
      }
    }
    cartItem.quantity = newQuantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
      variantId: normalizedVariantId
    });
  }

  return cartItem;
};

export const updateCartItemService = async (userId, productId, quantity, variantId = null) => {
  const normalizedVariantId = variantId ? Number(variantId) : null;

  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw { status: 404, message: "Cart not found" };

  const cartItem = await CartItem.findOne({ 
    where: { 
      cartId: cart.id, 
      productId,
      variantId: normalizedVariantId
    },
    include: [
      { model: Product },
      { model: models.ProductVariant, as: "variant" }
    ] 
  });
  
  if (!cartItem) throw { status: 404, message: "Cart item not found" };

  if (quantity <= 0) {
    await cartItem.destroy();
    return null;
  }

  // Stock validation during update
  if (normalizedVariantId && cartItem.variant) {
    if (cartItem.variant.stock < quantity) {
      throw { status: 400, message: "Insufficient stock for this update" };
    }
  } else {
    if (cartItem.Product.stock < quantity) {
      throw { status: 400, message: "Insufficient stock for this update" };
    }
  }

  cartItem.quantity = quantity;
  await cartItem.save();
  return cartItem;
};

export const getCartService = async (userId) => {
  const cart = await Cart.findOne({
    where: { userId },
    include: [
      {
        model: CartItem,
        include: [
          { model: Product },
          { model: models.ProductVariant, as: "variant" }
        ],
      },
    ],
    
    order: [[CartItem, "id", "ASC"]],
  });
  
  if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
    return { items: [], subtotal: 0, message: "Cart is empty" };
  }

  let subtotal = 0;
  const formattedItems = cart.CartItems.map((item) => {
    let activePrice;
    let originalPrice = null;
    let name = item.Product.name;
    let image = item.Product.imageUrl;
    let availableStock = item.Product.stock;

    if (item.variant) {
      if (item.variant.salePrice && Number(item.variant.salePrice) > 0 && Number(item.variant.salePrice) < Number(item.variant.price)) {
        activePrice = Number(item.variant.salePrice);
        originalPrice = Number(item.variant.price);
      } else {
        activePrice = Number(item.variant.price);
      }
      const vLabel = item.variant.variantValue || item.variant.materialName;
      name = `${item.Product.name} (${vLabel})`;
      if (item.variant.imageUrl) {
        image = item.variant.imageUrl;
      }
      availableStock = item.variant.stock;
    } else {
      if (item.Product.discountPrice && Number(item.Product.discountPrice) > 0 && Number(item.Product.discountPrice) < Number(item.Product.price)) {
        activePrice = Number(item.Product.discountPrice);
        originalPrice = Number(item.Product.price);
      } else {
        activePrice = Number(item.Product.price);
      }
    }

    const itemTotal = activePrice * item.quantity;
    subtotal += itemTotal;

    return {
      cartItemId: item.id,
      productId: item.Product.id,
      variantId: item.variantId,
      name,
      image,
      quantity: item.quantity,
      price: activePrice,
      originalPrice,
      itemTotal: parseFloat(itemTotal.toFixed(2)),
      availableStock,
    };
  });

  return {
    cartId: cart.id,
    items: formattedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingFee: SHIPPING_FEE,
    totalAmount: parseFloat((subtotal + SHIPPING_FEE).toFixed(2)),
  };
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  return { message: "Cart cleared" };
};