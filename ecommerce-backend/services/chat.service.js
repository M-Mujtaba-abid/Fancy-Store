import Groq from "groq-sdk";
import models from "../models/index.js";
import ApiError from "../utils/apiError.js";

const { User, Order, OrderItem, Product, ChatMessage } = models;

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const CHAT_MODEL = "llama-3.3-70b-versatile";

const CHAT_SYSTEM_PROMPT = `You are the Fancy Store AI assistant for vehicle top covers and car accessories.
You help customers choose the best car covers, dashboard mats, trunk mats, steering covers, and related products.
Keep answers practical, concise, and friendly.
Ask relevant follow-up questions like vehicle make/model/year when needed.
Prioritize product fit, quality, pricing guidance, and care instructions.
If product availability or exact pricing is unknown, clearly say so and suggest checking product pages or contacting support.`;

const formatRecentOrdersContext = (orders = []) => {
  if (!orders.length) {
    return "User has no recent orders.";
  }

  return orders
    .map((order, index) => {
      const itemsSummary =
        order.OrderItems?.map((item) => {
          const productName = item.Product?.name || "Unknown product";
          return `${productName} x${item.quantity}`;
        }).join(", ") || "No items";

      return `${index + 1}. Order #${order.id} | Status: ${order.status} | Total: ${order.totalAmount} | Items: ${itemsSummary}`;
    })
    .join("\n");
};

const buildSystemPrompt = ({ userName, recentOrdersText }) => {
  if (!userName) return CHAT_SYSTEM_PROMPT;

  return `${CHAT_SYSTEM_PROMPT}

Authenticated customer context:
- Customer name: ${userName}
- Recent orders:
${recentOrdersText}

Use this context naturally when it helps.`;
};

export const getChatUserContextService = async (userId) => {
  if (!userId) {
    return { userName: null, recentOrdersText: null };
  }

  const user = await User.findByPk(userId, { attributes: ["id", "name"] });
  if (!user) {
    return { userName: null, recentOrdersText: null };
  }

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

export const chatWithAssistantService = async ({ messages, userContext }) => {
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(500, "GROQ_API_KEY is missing in environment.");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, "At least one message is required.");
  }

  const safeMessages = messages
    .filter(
      (msg) =>
        msg &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string" &&
        msg.content.trim(),
    )
    .map((msg) => ({
      role: msg.role,
      content: msg.content.trim(),
    }));

  if (!safeMessages.length) {
    throw new ApiError(400, "Valid messages are required.");
  }

  const systemPrompt = buildSystemPrompt({
    userName: userContext?.userName || null,
    recentOrdersText: userContext?.recentOrdersText || null,
  });

  const completion = await groqClient.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 700,
    temperature: 0.5,
    messages: [
      { role: "system", content: systemPrompt },
      ...safeMessages,
    ],
  });

  const reply =
    completion.choices?.[0]?.message?.content?.trim() ||
    "I’m sorry, I could not generate a response right now.";

  return {
    reply,
    model: CHAT_MODEL,
  };
};

export const saveChatTurnService = async ({
  sessionId,
  userId = null,
  userMessage,
  assistantReply,
}) => {
  if (!sessionId) {
    throw new ApiError(400, "sessionId is required to persist chat.");
  }

  const rows = [];

  if (userMessage?.trim()) {
    rows.push({
      sessionId,
      userId,
      role: "user",
      content: userMessage.trim(),
    });
  }

  if (assistantReply?.trim()) {
    rows.push({
      sessionId,
      userId,
      role: "assistant",
      content: assistantReply.trim(),
    });
  }

  if (rows.length) {
    await ChatMessage.bulkCreate(rows);
  }
};
