import models from "../models/index.js";
const { Cart, CartItem, Product } = models;

export const addToCartService = async (userId, productId, quantity) => {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    cart = await Cart.create({ userId });
  }

  let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
  }

  return cartItem;
};

export const updateCartItemService = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw { status: 404, message: "Cart not found" };

  const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
  if (!cartItem) throw { status: 404, message: "Cart item not found" };

  if (quantity <= 0) {
    await cartItem.destroy();
    return null; // null matlab item delete ho gaya
  }

  cartItem.quantity = quantity;
  await cartItem.save();
  return cartItem;
};

export const getCartService = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw { status: 404, message: "Cart not found" };

  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [{ model: Product }],
  });

  return { cartId: cart.id, items };
};