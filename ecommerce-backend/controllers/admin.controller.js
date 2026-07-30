import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import { ChatRoom, LiveChatMessage } from "../models/index.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Yahan hum Sequelize ka .count() use kar rahe hain
  const [totalUsers, totalProducts, totalOrders, totalReviews] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    Review.count()
  ]);

  res.status(200).json(
    new ApiResponse(200, { totalUsers, totalProducts, totalOrders, totalReviews }, "Stats fetched successfully")
  );
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
