import models from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate, adminNewOrderTemplate } from "../utils/emailTemplate.js";

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
    } = orderData;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) throw { status: 404, message: "Cart not found." };

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    if (!cartItems || cartItems.length === 0)
      throw { status: 400, message: "Cart is empty." };

    let totalAmount = 0;
    const orderItemRows = [];

    for (let item of cartItems) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });
      if (!product) continue;

      if (product.stock < item.quantity) {
        throw { status: 400, message: `Stock finished for ${product.name}` };
      }

      const activePrice =
        product.discountPrice && product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      totalAmount += activePrice * item.quantity;

      product.stock -= item.quantity;
      await product.save({ transaction: t });

      orderItemRows.push({
        productId: product.id,
        quantity: item.quantity,
        price: activePrice,
      });
    }

    const order = await Order.create(
      {
        userId,
        totalAmount,
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
      { transaction: t },
    );

    const rowsToInsert = orderItemRows.map((r) => ({
      ...r,
      orderId: order.id,
    }));
    if (rowsToInsert.length) {
      await OrderItem.bulkCreate(rowsToInsert, { transaction: t });
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    // ✅ Pehle commit
    await t.commit();

    // ✅ Phir email — alag try/catch mein
    try {
      const user = await User.findByPk(userId);
      await Promise.all([
        sendEmail(
          user.email,
          "Order Confirmed — Fancy Store 🎉",
          orderConfirmationTemplate(user.name, order)
        ),
        sendEmail(
          process.env.ADMIN_EMAIL,
          "📦 New Order Received!",
          adminNewOrderTemplate(user.name, user.email, order)
        ),
      ]);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // Email fail ho toh order cancel nahi hoga
    }

    return { orderId: order.id };

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