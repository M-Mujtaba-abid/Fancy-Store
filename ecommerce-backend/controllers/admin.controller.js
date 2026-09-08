import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import { ChatRoom, LiveChatMessage, OrderItem } from "../models/index.js";
import { Op } from "sequelize";

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Yahan hum Sequelize ka .count() use kar rahe hain
  const [totalUsers, totalProducts, totalOrders, totalReviews, cancelledOrders] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    Review.count(),
    Order.count({ where: { status: "cancelled" } }),
  ]);

  const cancellationRate = totalOrders ? Number(((cancelledOrders / totalOrders) * 100).toFixed(2)) : 0;
  res.status(200).json(
    new ApiResponse(200, { totalUsers, totalProducts, totalOrders, cancelledOrders, cancellationRate, totalReviews }, "Stats fetched successfully")
  );
});

const getDeliveredItems = () => OrderItem.findAll({
  include: [
    { model: Order, where: { status: "delivered" }, attributes: [] },
    { model: Product, attributes: ["costPrice"] },
  ],
});

export const getProfitSummary = asyncHandler(async (req, res) => {
  const items = await getDeliveredItems();
  const totals = items.reduce((summary, item) => {
    const quantity = Number(item.quantity) || 0;
    summary.totalRevenue += (Number(item.price) || 0) * quantity;
    summary.totalCost += (Number(item.Product?.costPrice) || 0) * quantity;
    return summary;
  }, { totalRevenue: 0, totalCost: 0 });

  totals.netProfit = totals.totalRevenue - totals.totalCost;
  totals.profitMargin = totals.totalRevenue
    ? (totals.netProfit / totals.totalRevenue) * 100
    : 0;

  res.status(200).json(new ApiResponse(200, {
    totalRevenue: Number(totals.totalRevenue.toFixed(2)),
    totalCost: Number(totals.totalCost.toFixed(2)),
    netProfit: Number(totals.netProfit.toFixed(2)),
    profitMargin: Number(totals.profitMargin.toFixed(2)),
  }, "Profit summary fetched successfully"));
});

export const getSalesChart = asyncHandler(async (req, res) => {
  const period = req.query.period || "30days";
  if (period !== "30days") {
    return res.status(400).json({ message: "Only the 30days period is supported" });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 29);
  const orders = await Order.findAll({
    where: { status: "delivered", createdAt: { [Op.gte]: start } },
    include: [{ model: OrderItem, attributes: ["quantity", "price"] }],
    order: [["createdAt", "ASC"]],
  });

  const days = new Map();
  for (let index = 0; index < 30; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    days.set(date.toISOString().slice(0, 10), { date: date.toISOString().slice(0, 10), revenue: 0, orderCount: 0 });
  }

  for (const order of orders) {
    const date = new Date(order.createdAt).toISOString().slice(0, 10);
    const day = days.get(date);
    if (!day) continue;
    day.orderCount += 1;
    day.revenue += (order.OrderItems || []).reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  }

  res.status(200).json(new ApiResponse(200, Array.from(days.values()).map((day) => ({
    ...day,
    revenue: Number(day.revenue.toFixed(2)),
  })), "Sales chart fetched successfully"));
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Math.max(0, Number.parseInt(req.query.threshold, 10) || 5);
  const products = await Product.findAll({
    where: { stockQuantity: { [Op.lt]: threshold } },
    attributes: ["id", "name", "imageUrl", "stock", "stockQuantity"],
    order: [["stockQuantity", "ASC"], ["name", "ASC"]],
  });
  res.status(200).json(new ApiResponse(200, products, "Low stock products fetched successfully"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "avatar", "createdAt"],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const getChatRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.findAll({
    include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    order: [["lastMessageAt", "DESC"]],
  });

  res.status(200).json(new ApiResponse(200, rooms, "Chat rooms fetched successfully"));
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const messages = await LiveChatMessage.findAll({
    where: { chatRoomId: roomId },
    order: [["createdAt", "ASC"]],
  });

  res.status(200).json(new ApiResponse(200, messages, "Room messages fetched successfully"));
});

export const markRoomAsRead = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  await ChatRoom.update({ unreadAdminCount: 0 }, { where: { id: roomId } });
  await LiveChatMessage.update({ isRead: true }, { where: { chatRoomId: roomId } });

  res.status(200).json(new ApiResponse(200, {}, "Room marked as read successfully"));
});

export const deleteChatRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // Delete messages first to clean up associations
  await LiveChatMessage.destroy({ where: { chatRoomId: roomId } });

  // Delete the chat room
  const deletedCount = await ChatRoom.destroy({ where: { id: roomId } });

  if (!deletedCount) {
    return res.status(404).json(new ApiResponse(404, null, "Chat room not found"));
  }

  res.status(200).json(new ApiResponse(200, { roomId }, "Chat room deleted successfully"));
});
