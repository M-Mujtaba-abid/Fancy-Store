import models from "../models/index.js";
const { Cart, CartItem, Product } = models;

export const addToCartService = async (userId, productId, quantity) => {
  // 1. Check if product exists and has stock
  const product = await Product.findByPk(productId);
  if (!product) throw { status: 404, message: "Product not found" };
  if (product.stock < quantity) {
    throw { status: 400, message: `Insufficient stock. Only ${product.stock} left.` };
  }

  // 2. Find or Create Cart
  let [cart] = await Cart.findOrCreate({ where: { userId } });

  // 3. Check if item already in cart
  let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });

  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw { status: 400, message: "Total quantity exceeds available stock" };
    }
    cartItem.quantity = newQuantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
  }

  return cartItem;
};

export const updateCartItemService = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) throw { status: 404, message: "Cart not found" };

  const cartItem = await CartItem.findOne({ 
    where: { cartId: cart.id, productId },
    include: [Product] 
  });
  
  if (!cartItem) throw { status: 404, message: "Cart item not found" };

  if (quantity <= 0) {
    await cartItem.destroy();
    return null;
  }

  // Stock validation during update
  if (cartItem.Product.stock < quantity) {
    throw { status: 400, message: "Insufficient stock for this update" };
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
        include: [{ model: Product }],
      },
    ],
  });

  if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
    return { items: [], subtotal: 0, message: "Cart is empty" };
  }

  let subtotal = 0;
  const formattedItems = cart.CartItems.map((item) => {
    const activePrice = item.Product.discountPrice > 0 ? item.Product.discountPrice : item.Product.price;
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

  return {
    cartId: cart.id,
    items: formattedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
  };
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  return { message: "Cart cleared" };
};