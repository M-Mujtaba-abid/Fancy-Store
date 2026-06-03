import models from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate, adminNewOrderTemplate } from "../utils/emailTemplate.js";
import { SHIPPING_FEE } from "../constants/index.js";

const { Cart, CartItem, Product, Order, OrderItem, User } = models;
// ================= PLACE ORDER =================
export const placeOrderService = async (userId, orderData) => {
  const sequelize = Order.sequelize;
  const t = await sequelize.transaction();

  try {
    const {
      fullName,
      phoneNumber,
      email,
      address,
      city,
      postalCode,
      country,
      paymentMethod,
      buyNowProductId, // ✅ NAYA: Buy Now Product ID
      buyNowQuantity   // ✅ NAYA: Buy Now Quantity
    } = orderData;

    let totalAmount = 0;
    const shippingFee = SHIPPING_FEE;
    const orderItemRows = [];
    let cart = null;

    // =======================================================
    // SCENARIO 1: DIRECT "BUY NOW" FLOW (Trolley ko hath nahi lagana)
    // =======================================================
    if (buyNowProductId && buyNowQuantity) {
      const product = await Product.findByPk(buyNowProductId, { transaction: t });
      if (!product) throw { status: 404, message: "Product not found." };
      
      if (product.stock < buyNowQuantity) {
        throw { status: 400, message: `Stock finished for ${product.name}` };
      }

      const activePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      totalAmount = activePrice * buyNowQuantity;

      product.stock -= buyNowQuantity;
      await product.save({ transaction: t });

      orderItemRows.push({
        productId: product.id,
        quantity: buyNowQuantity,
        price: activePrice,
      });
    } 
    // =======================================================
    // SCENARIO 2: NORMAL "CART" FLOW (Trolley ka saman aur Trolley khali)
    // =======================================================
    else {
      cart = await Cart.findOne({ where: { userId } });
      if (!cart) throw { status: 404, message: "Cart not found." };

      const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
      if (!cartItems || cartItems.length === 0)
        throw { status: 400, message: "Cart is empty." };

      for (let item of cartItems) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) continue;

        if (product.stock < item.quantity) {
          throw { status: 400, message: `Stock finished for ${product.name}` };
        }

        const activePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
        totalAmount += activePrice * item.quantity;

        product.stock -= item.quantity;
        await product.save({ transaction: t });

        orderItemRows.push({
          productId: product.id,
          quantity: item.quantity,
          price: activePrice,
        });
      }
    }

    // ✅ ORDER CREATION (Dono scenarios mein order banega)
    totalAmount += shippingFee;
    const order = await Order.create(
      {
        userId,
        totalAmount,
        shippingFee,
        status: "pending",
        fullName,
        phoneNumber,
        email,
        address,
        city,
        postalCode,
        country,
        paymentMethod,
      },
      { transaction: t }
    );

    const rowsToInsert = orderItemRows.map((r) => ({
      ...r,
      orderId: order.id,
    }));
    
    if (rowsToInsert.length) {
      await OrderItem.bulkCreate(rowsToInsert, { transaction: t });
    }

    // ✅ SIRF CART FLOW MEIN CART DELETE KARO (Buy now mein delete NAHI hoga)
    if (!buyNowProductId && cart) {
      await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    }

    // ✅ Pehle commit
    await t.commit();

    // ✅ Phir email — alag try/catch mein (Aapki Exact Same Logic)
    try {
      const user = await User.findByPk(userId);
      const emailPromises = [];

      // 1. Customer ko bhejien (agar email exist karti hai)
      if (orderData.email) {
        emailPromises.push(
          sendEmail(
            // user.email,
            orderData.email,
            "Order Confirmed — Fancy Store 🎉",
           orderConfirmationTemplate(user ? user.name : "Customer", order)
          )
        );
      }

      // 2. Admin ko bhejien (agar env set hai)
      if (process.env.ADMIN_EMAIL) {
        emailPromises.push(
          sendEmail(
            process.env.ADMIN_EMAIL,
            "📦 New Order Received!",
           adminNewOrderTemplate(user ? user.name : "Customer", orderData.email || 'N/A', order)
          )
        );
      }

      await Promise.all(emailPromises);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
    }

    return { orderId: order.id, shippingFee };

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// ================= GET USER'S ORDERS =================
export const getOrdersService = async (userId) => {
  return await Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, include: [Product] }],
    order: [["createdAt", "DESC"]],
  });
};

// ================= ADMIN: GET ALL ORDERS =================
export const getAllOrdersService = async () => {
  return await Order.findAll({
    include: [
      { model: User, attributes: ["id", "name", "email", "role"] },
      { model: OrderItem, include: [Product] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// ================= ADMIN: GET ORDERS COUNT =================
export const getOrdersCountService = async () => {
  return await Order.count();
};

// ================= ADMIN: UPDATE STATUS =================
export const updateOrderStatusService = async (id, status) => {
  const order = await Order.findByPk(id);
  if (!order) throw { status: 404, message: "Order not found" };

  order.status = status;
  await order.save();
  return order;
};