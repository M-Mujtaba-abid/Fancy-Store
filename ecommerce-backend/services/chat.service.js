// services/chat.service.js
import models from "../models/index.js";
import ApiError from "../utils/apiError.js";

const { User, Order, OrderItem, Product, ChatMessage } = models;

// Sirf formatting ke liye
const formatRecentOrdersContext = (orders = []) => {
  if (!orders.length) return "User has no recent orders.";

  return orders.map((order, index) => {
    const itemsSummary = order.OrderItems?.map((item) => {
      const productName = item.Product?.name || "Unknown product";
      return `${productName} x${item.quantity}`;
    }).join(", ") || "No items";

    return `${index + 1}. Order #${order.id} | Status: ${order.status} | Total: ${order.totalAmount} | Items: ${itemsSummary}`;
  }).join("\n");
};

// 1. User ka context nikalne wali service (Keep this)
export const getChatUserContextService = async (userId) => {
  if (!userId) return { userName: null, recentOrdersText: null };

  const user = await User.findByPk(userId, { attributes: ["id", "name"] });
  if (!user) return { userName: null, recentOrdersText: null };

  const recentOrders = await Order.findAll({
    where: { userId: user.id },
    attributes: ["id", "status", "totalAmount", "createdAt"],
    include: [
      {
        model: OrderItem,
        attributes: ["id", "quantity", "price"],
        include: [{ model: Product, attributes: ["id", "name"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 3,
  });

  return {
    userName: user.name,
    recentOrdersText: formatRecentOrdersContext(recentOrders),
  };
};

// 2. Chat History DB mein save karne wali service (Keep this)
export const saveChatTurnService = async ({ sessionId, userId = null, userMessage, assistantReply }) => {
  if (!sessionId) throw new ApiError(400, "sessionId is required to persist chat.");

  const rows = [];
  if (userMessage?.trim()) {
    rows.push({ sessionId, userId, role: "user", content: userMessage.trim() });
  }
  if (assistantReply?.trim()) {
    rows.push({ sessionId, userId, role: "assistant", content: assistantReply.trim() });
  }
  if (rows.length) {
    await ChatMessage.bulkCreate(rows);
  }
};