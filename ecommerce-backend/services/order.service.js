import models from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate, adminNewOrderTemplate, orderStatusUpdateTemplate } from "../utils/emailTemplate.js";
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
      buyNowProductId,
      buyNowQuantity,
      buyNowVariantId,
      guestCartItems,
    } = orderData;

    let totalAmount = 0;
    const shippingFee = SHIPPING_FEE;
    const orderItemRows = [];
    let cart = null;

    const addProductToOrder = async (productId, quantity, variantId = null) => {
      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) throw { status: 404, message: "Product not found." };

      let activePrice;

      if (variantId) {
        const variant = await models.ProductVariant.findOne({
          where: { id: variantId, productId },
          transaction: t
        });
        if (!variant) throw { status: 404, message: "Product variant not found." };
        if (variant.stock < quantity) {
          throw { status: 400, message: `Insufficient stock for variant (${variant.materialName}) of product ${product.name}.` };
        }
        activePrice = variant.price;
        variant.stock -= quantity;
        await variant.save({ transaction: t });

        // Increment product sold count when variant is purchased
        product.sold = (product.sold || 0) + quantity;
        await product.save({ transaction: t });
      } else {
        if (product.stock < quantity) {
          throw { status: 400, message: `Stock finished for ${product.name}` };
        }
        activePrice =
          product.discountPrice && product.discountPrice > 0
            ? product.discountPrice
            : product.price;
        product.stock -= quantity;
        product.sold = (product.sold || 0) + quantity;
        await product.save({ transaction: t });
      }

      totalAmount += activePrice * quantity;

      orderItemRows.push({
        productId: product.id,
        quantity,
        price: activePrice,
        variantId: variantId ? Number(variantId) : null,
      });
    };

    // =======================================================
    // SCENARIO 1: DIRECT "BUY NOW" FLOW
    // =======================================================
    if (buyNowProductId && buyNowQuantity) {
      totalAmount = 0;
      await addProductToOrder(buyNowProductId, buyNowQuantity, buyNowVariantId);
    }
    // =======================================================
    // SCENARIO 2: LOGGED-IN "CART" FLOW
    // =======================================================
    else if (userId) {
      cart = await Cart.findOne({ where: { userId } });
      if (!cart) throw { status: 404, message: "Cart not found." };

      const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
      if (!cartItems || cartItems.length === 0) {
        throw { status: 400, message: "Cart is empty." };
      }

      for (const item of cartItems) {
        await addProductToOrder(item.productId, item.quantity, item.variantId);
      }
    }
    // =======================================================
    // SCENARIO 3: GUEST "CART" FLOW (items sent from client)
    // =======================================================
    else if (guestCartItems?.length) {
      totalAmount = 0;
      for (const item of guestCartItems) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw { status: 400, message: "Invalid guest cart item." };
        }
        await addProductToOrder(item.productId, item.quantity, item.variantId);
      }
    } else {
      throw { status: 400, message: "Cart is empty." };
    }

    if (orderItemRows.length === 0) {
      throw { status: 400, message: "No valid items to order." };
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
      const user = userId ? await User.findByPk(userId) : null;
      const emailPromises = [];
      const customerName = user?.name || fullName || "Customer";

      if (orderData.email) {
        emailPromises.push(
          sendEmail(
            orderData.email,
            "Order Confirmed — Fancy Store 🎉",
            orderConfirmationTemplate(customerName, order)
          )
        );
      }

      if (process.env.ADMIN_EMAIL) {
        emailPromises.push(
          sendEmail(
            process.env.ADMIN_EMAIL,
            "📦 New Order Received!",
            adminNewOrderTemplate(customerName, orderData.email || "N/A", order)
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


export const getOrdersService = async (userId, guestData = null) => {
  let whereClause = {};

  if (userId) {
    // Registered user ke liye sirf uski userId match karo
    whereClause.userId = userId;
  } else if (guestData) {
    // Guest user / direct tracking ke liye Order ID aur Phone Number match karo
    const { orderId, phone } = guestData;
    if (!orderId || !phone) {
      throw { status: 400, message: "Both Order ID and Phone Number are required for order tracking." };
    }
    whereClause.id = orderId;
    whereClause.phoneNumber = phone;
  }

  const orders = await Order.findAll({
    where: whereClause,
    include: [
      { 
        model: OrderItem, 
        include: [
          Product,
          { model: models.ProductVariant, as: "variant" }
        ] 
      }
    ],
    order: [["createdAt", "DESC"]],
  });

  if (guestData && orders.length === 0) {
    throw { status: 404, message: "No order found matching the provided Order ID and Phone Number." };
  }

  return orders;
};

// ================= ADMIN: GET ALL ORDERS =================
export const getAllOrdersService = async () => {
  return await Order.findAll({
    include: [
      { model: User, attributes: ["id", "name", "email", "role"] },
      { 
        model: OrderItem, 
        include: [
          Product,
          { model: models.ProductVariant, as: "variant" }
        ] 
      },
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
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  order.status = status;
  await order.save();

  // Send status update email to the customer asynchronously
  try {
    const customerName = order.fullName || "Customer";
    let subject = `Order #${order.id} Status Update — Fancy Store`;
    
    const lowerStatus = (status || "").toLowerCase();
    if (lowerStatus === "pending") {
      subject = `Order Confirmed — Fancy Store 🎉`;
    } else if (lowerStatus === "accepted" || lowerStatus === "processing") {
      subject = `Your order has been accepted! 📦 — Fancy Store`;
    } else if (lowerStatus === "ready_to_ship") {
      subject = `Your order is ready to ship! 📦 — Fancy Store`;
    } else if (lowerStatus === "shipped") {
      subject = `Your order has been shipped! 🚚 — Fancy Store`;
    } else if (lowerStatus === "delivered") {
      subject = `Your order has been delivered! 🎉 — Fancy Store`;
    } else if (lowerStatus === "cancelled") {
      subject = `Your order has been cancelled — Fancy Store`;
    }

    if (order.email) {
      sendEmail(
        order.email,
        subject,
        orderStatusUpdateTemplate(customerName, order)
      )
      .catch(err => {
        console.error("Error sending status update email:", err);
      });
    }
  } catch (emailErr) {
    console.error("Failed to prepare status update email:", emailErr);
  }

  return order;
};