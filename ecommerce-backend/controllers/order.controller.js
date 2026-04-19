// import {
//   placeOrderService,
//   getOrdersService,
//   getAllOrdersService,
//   getOrdersCountService,
//   updateOrderStatusService,
// } from "../services/order.service.js";

// const ALLOWED_PAYMENTS = ["COD", "Bank Transfer", "Card"];
// const ALLOWED_STATUSES = [
//   "pending",
//   "accepted",
//   "cancelled",
//   "ready_to_ship",
//   "shipped",
//   "delivered",
// ];

// // ================= PLACE ORDER =================
// export const placeOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       fullName,
//       phoneNumber,
//       email,
//       address,
//       city,
//       postalCode,
//       country,
//       paymentMethod,
//     } = req.body;

//     if (
//       !fullName ||
//       !phoneNumber ||
//       !email ||
//       !address ||
//       !city ||
//       !postalCode ||
//       !country
//     ) {
//       return res
//         .status(400)
//         .json({
//           message: "Please provide complete personal and delivery information.",
//         });
//     }

//     if (!ALLOWED_PAYMENTS.includes(paymentMethod)) {
//       return res.status(400).json({ message: "Invalid payment method." });
//     }

//     const data = await placeOrderService(userId, req.body);
//     return res.status(201).json({ message: "Order placed", ...data });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(err.status || 500)
//       .json({ message: err.message || "Server error" });
//   }
// };

// // ================= GET USER'S ORDERS =================
// export const getOrders = async (req, res) => {
//   try {
//     const orders = await getOrdersService(req.user.id);
//     return res.status(200).json({ orders });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(err.status || 500)
//       .json({ message: err.message || "Server error" });
//   }
// };

// // ================= ADMIN: GET ALL ORDERS =================
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await getAllOrdersService();
//     return res.status(200).json({ orders });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(err.status || 500)
//       .json({ message: err.message || "Server error" });
//   }
// };

// // ================= ADMIN: GET ORDERS COUNT =================
// export const getOrdersCount = async (req, res) => {
//   try {
//     const count = await getOrdersCountService();
//     return res.status(200).json({ count });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(err.status || 500)
//       .json({ message: err.message || "Server error" });
//   }
// };

// // ================= ADMIN: UPDATE STATUS =================
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!ALLOWED_STATUSES.includes((status || "").toLowerCase())) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const order = await updateOrderStatusService(id, status);
//     return res.status(200).json({ message: "Status updated", order });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(err.status || 500)
//       .json({ message: err.message || "Server error" });
//   }
// };


import {
  placeOrderService,
  getOrdersService,
  getAllOrdersService,
  getOrdersCountService,
  updateOrderStatusService,
} from "../services/order.service.js";
import { ORDER_STATUSES, PAYMENT_METHODS } from "../constants/index.js"; 

// ================= PLACE ORDER =================
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, email, address, city, postalCode, country, paymentMethod } = req.body;

    if (!fullName || !phoneNumber || !email || !address || !city || !postalCode || !country) {
      return res.status(400).json({ message: "Please provide complete personal and delivery information." });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) { // ✅ constant use
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const data = await placeOrderService(userId, req.body);
    return res.status(201).json({ message: "Order placed", ...data });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

// ================= GET USER'S ORDERS =================
export const getOrders = async (req, res) => {
  try {
    const orders = await getOrdersService(req.user.id);
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

// ================= ADMIN: GET ALL ORDERS =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersService();
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

// ================= ADMIN: GET ORDERS COUNT =================
export const getOrdersCount = async (req, res) => {
  try {
    const count = await getOrdersCountService();
    return res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

// ================= ADMIN: UPDATE STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ORDER_STATUSES.includes((status || "").toLowerCase())) { // ✅ constant use
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await updateOrderStatusService(id, status);
    return res.status(200).json({ message: "Status updated", order });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};