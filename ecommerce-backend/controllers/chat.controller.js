import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { chatWithAgent } from "../services/agent.service.js"; // 👈 Hamari nayi LangChain service
import { getChatUserContextService, saveChatTurnService } from "../services/chat.service.js"; // Aapki purani services
import { ChatRoom, LiveChatMessage, User } from "../models/index.js";

const getOptionalUserIdFromCookie = (req) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    return decoded?.id || null;
  } catch {
    return null;
  }
};

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const { messages, sessionId } = req.body;

  if (!Array.isArray(messages) || !messages.length) {
    throw new ApiError(400, "messages array is required.");
  }

  const resolvedSessionId = sessionId?.trim() || crypto.randomUUID();
  const userId = getOptionalUserIdFromCookie(req);
  
  // 1. User ki pichli history aur orders layein
  const userContext = await getChatUserContextService(userId);
  
  // 2. Sirf latest message nikal kar Agent ko bhejien
  const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content;
  
  // 2.5. History ko format karein
  const chatHistory = messages.slice(0, -1).map(m => {
    return {
      role: m.role,
      content: m.content
    };
  });

  // 3. Agentic Service Call (Tool calling yahan hogi)
  // Hum messages array as chatHistory bhej rahe hain
  const botReply = await chatWithAgent(lastUserMessage, chatHistory, userId, userContext);

  // 4. Chat ko database mein save karein
  await saveChatTurnService({
    sessionId: resolvedSessionId,
    userId,
    userMessage: lastUserMessage,
    assistantReply: botReply,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { reply: botReply, sessionId: resolvedSessionId },
      "Chat response generated successfully"
    )
  );
});

// ================= LIVE CHAT SERVERLESS ENDPOINTS =================

export const joinLiveChat = asyncHandler(async (req, res) => {
  const { userId, guestId, userType } = req.body;
  let room;

  if (userId && userType !== "admin") {
    const numericUserId = Number(userId);
    if (!isNaN(numericUserId) && numericUserId > 0) {
      room = await ChatRoom.findOne({
        where: { userId: numericUserId, status: "active" },
        include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      });

      const cleanGuestId = guestId ? String(guestId).trim() : "";
      const isValidGuestId = cleanGuestId && cleanGuestId !== "undefined" && cleanGuestId !== "null" && cleanGuestId.length > 5;

      if (!room && isValidGuestId) {
        const guestRoom = await ChatRoom.findOne({
          where: { guestId: cleanGuestId, status: "active" },
        });
        if (guestRoom) {
          await guestRoom.update({
            userId: numericUserId,
            userType: "registered",
          });
          room = await ChatRoom.findByPk(guestRoom.id, {
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
          });
        }
      }

      if (!room) {
        room = await ChatRoom.create({
          userId: numericUserId,
          userType: "registered",
        });
        room = await ChatRoom.findByPk(room.id, {
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        });
      }
    }
  }

  const cleanGuestId = guestId ? String(guestId).trim() : "";
  const isValidGuestId = cleanGuestId && cleanGuestId !== "undefined" && cleanGuestId !== "null" && cleanGuestId.length > 5;

  if (!room && isValidGuestId) {
    room = await ChatRoom.findOne({
      where: { guestId: cleanGuestId, status: "active" },
    });
    if (!room) {
      room = await ChatRoom.create({
        guestId: cleanGuestId,
        userType: "guest",
      });
    }
  }

  if (!room) {
    const fallbackGuestId = `guest_${crypto.randomUUID()}`;
    room = await ChatRoom.create({
      guestId: fallbackGuestId,
      userType: "guest",
    });
  }

  const roomDetails = await ChatRoom.findByPk(room.id, {
    include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
  });

  const existingMessages = await LiveChatMessage.findAll({
    where: { chatRoomId: room.id },
    order: [["createdAt", "ASC"]],
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        chatRoomId: room.id,
        room: roomDetails,
        messages: existingMessages,
      },
      "Joined live chat room successfully"
    )
  );
});

export const sendLiveChatMessage = asyncHandler(async (req, res) => {
  let { chatRoomId, senderType, senderId, message, messageType, fileUrl } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "Message content is required.");
  }

  let targetRoom;
  if (chatRoomId) {
    targetRoom = await ChatRoom.findByPk(chatRoomId);
  }

  if (!targetRoom) {
    if (senderType === "user" && Number(senderId) > 0) {
      targetRoom = await ChatRoom.findOne({
        where: { userId: Number(senderId), status: "active" },
      });
      if (!targetRoom) {
        targetRoom = await ChatRoom.create({
          userId: Number(senderId),
          userType: "registered",
        });
      }
    } else {
      const cleanGuestId = senderId ? String(senderId).trim() : `guest_${crypto.randomUUID()}`;
      targetRoom = await ChatRoom.findOne({
        where: { guestId: cleanGuestId, status: "active" },
      });
      if (!targetRoom) {
        targetRoom = await ChatRoom.create({
          guestId: cleanGuestId,
          userType: "guest",
        });
      }
    }
    chatRoomId = targetRoom.id;
  }

  const newMessage = await LiveChatMessage.create({
    chatRoomId,
    senderType: senderType || "guest",
    senderId: String(senderId || "guest"),
    message: message.trim(),
    messageType: messageType || "text",
    fileUrl: fileUrl || null,
  });

  await ChatRoom.update(
    {
      lastMessage: message.trim(),
      lastMessageAt: new Date(),
    },
    { where: { id: chatRoomId } }
  );

  if (senderType === "admin") {
    await ChatRoom.increment("unreadUserCount", { by: 1, where: { id: chatRoomId } });
  } else {
    await ChatRoom.increment("unreadAdminCount", { by: 1, where: { id: chatRoomId } });
  }

  const roomDetails = await ChatRoom.findByPk(chatRoomId, {
    include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        chatRoomId,
        message: newMessage,
        room: roomDetails,
      },
      "Message sent successfully"
    )
  );
});

export const getLiveChatMessages = asyncHandler(async (req, res) => {
  const { chatRoomId } = req.query;

  if (!chatRoomId) {
    throw new ApiError(400, "chatRoomId is required.");
  }

  const messages = await LiveChatMessage.findAll({
    where: { chatRoomId },
    order: [["createdAt", "ASC"]],
  });

  res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export const markLiveChatRead = asyncHandler(async (req, res) => {
  const { chatRoomId, userType } = req.body;

  if (!chatRoomId) {
    throw new ApiError(400, "chatRoomId is required.");
  }

  if (userType === "admin") {
    await ChatRoom.update({ unreadAdminCount: 0 }, { where: { id: chatRoomId } });
    await LiveChatMessage.update({ isRead: true }, { where: { chatRoomId } });
  } else {
    await ChatRoom.update({ unreadUserCount: 0 }, { where: { id: chatRoomId } });
  }

  res.status(200).json(new ApiResponse(200, {}, "Marked as read successfully"));
});