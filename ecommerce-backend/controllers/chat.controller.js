import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  chatWithAssistantService,
  getChatUserContextService,
  saveChatTurnService,
} from "../services/chat.service.js";

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
  const userContext = await getChatUserContextService(userId);
  const data = await chatWithAssistantService({ messages, userContext });

  const lastUserMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message?.role === "user" &&
        typeof message.content === "string" &&
        message.content.trim(),
    )?.content;

  await saveChatTurnService({
    sessionId: resolvedSessionId,
    userId,
    userMessage: lastUserMessage,
    assistantReply: data.reply,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...data, sessionId: resolvedSessionId },
        "Chat response generated successfully",
      ),
    );
});
