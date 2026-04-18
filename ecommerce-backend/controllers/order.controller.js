
// import models from "../models/index.js";
// const { Cart, CartItem, Product, Order, OrderItem, User } = models;

// export const placeOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const shipping = req.body?.shipping || {};

//     // Get user's cart
//     const cart = await Cart.findOne({ where: { userId } });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
//     if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

//     // Calculate total
//     let totalAmount = 0;
//     for (let item of cartItems) {
//       const product = await Product.findByPk(item.productId);
//       totalAmount += product.price * item.quantity;
//     }

//     // Create Order
//     const order = await Order.create({
//       userId,
//       totalAmount,
//       status: "Pending",
//       shippingName: shipping.name || null,
//       shippingPhone: shipping.phone || null,
//       shippingAddress: shipping.address || null,
//       shippingCity: shipping.city || null,
//       shippingPostalCode: shipping.postalCode || null,
//     });

//     // Create OrderItems
//     for (let item of cartItems) {
//       const product = await Product.findByPk(item.productId);
//       await OrderItem.create({
//         orderId: order.id,
//         productId: product.id,
//         quantity: item.quantity,
//         price: product.price,
//       });
//     }

//     // Clear cart
//     await CartItem.destroy({ where: { cartId: cart.id } });

//     return res.status(200).json({ message: "Order placed", orderId: order.id });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// // Removed direct order endpoint per request

// export const getOrders = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const orders = await Order.findAll({
//       where: { userId },
//       include: [{ model: OrderItem, include: [Product] }],
//     });
//     return res.status(200).json({ orders });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Admin: get all users' orders
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//       include: [
//         { model: User, attributes: ["id", "name", "email", "role"] },
//         { model: OrderItem, include: [Product] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });
//     return res.status(200).json({ orders });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Admin: get total orders count
// export const getOrdersCount = async (req, res) => {
//   try {
//     const count = await Order.count();
//     return res.status(200).json({ count });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Admin: update order status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const allowed = ["pending", "accepted", "cancelled", "ready_to_ship", "shipped", "delivered"];
//     if (!allowed.includes((status || "").toLowerCase())) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const order = await Order.findByPk(id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     order.status = status;
//     await order.save();
//     return res.status(200).json({ message: "Status updated", order });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };











// controllers/order.controller.js
import models from "../models/index.js";
const { Cart, CartItem, Product, Order, OrderItem, User } = models;

// ================= PLACE ORDER =================
export const placeOrder = async (req, res) => {
  const sequelize = Order.sequelize; 
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;

    const {
      fullName,
      phoneNumber,
      email,
      address,
      city,
      postalCode,
      country,
      paymentMethod, // COD | Bank Transfer | Card
    } = req.body;

    if (!fullName || !phoneNumber || !email || !address || !city || !postalCode || !country) {
      await t.rollback();
      return res.status(400).json({ message: "Please provide complete personal and delivery information." });
    }

    const allowedPayments = ["COD", "Bank Transfer", "Card"];
    if (!allowedPayments.includes(paymentMethod)) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      await t.rollback();
      return res.status(404).json({ message: "Cart not found." });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    if (!cartItems || cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Cart is empty." });
    }

    let totalAmount = 0;
    const orderItemRows = [];
    for (let item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (!product) continue;
      const price = Number(product.price) || 0;
      totalAmount += price * item.quantity;
      orderItemRows.push({
        productId: product.id,
        quantity: item.quantity,
        price,
      });
    }

    const order = await Order.create({
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
    }, { transaction: t });

    const rowsToInsert = orderItemRows.map(r => ({ ...r, orderId: order.id }));
    if (rowsToInsert.length) {
      await OrderItem.bulkCreate(rowsToInsert, { transaction: t });
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();
    return res.status(201).json({ message: "Order placed", orderId: order.id });
  } catch (err) {
    if (t) await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= GET USER'S ORDERS =================
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= ADMIN: GET ALL ORDERS =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email", "role"] },
        { model: OrderItem, include: [Product] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= ADMIN: GET ORDERS COUNT =================
export const getOrdersCount = async (req, res) => {
  try {
    const count = await Order.count();
    return res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= ADMIN: UPDATE STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "accepted", "cancelled", "ready_to_ship", "shipped", "delivered"];
    if (!allowed.includes((status || "").toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    return res.status(200).json({ message: "Status updated", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
