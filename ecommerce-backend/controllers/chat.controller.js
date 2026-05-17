import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { chatWithAgent } from "../services/agent.service.js"; // 👈 Hamari nayi LangChain service
import { getChatUserContextService, saveChatTurnService } from "../services/chat.service.js"; // Aapki purani services

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