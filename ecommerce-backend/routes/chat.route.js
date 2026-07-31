import express from "express";
import {
  chatWithAssistant,
  joinLiveChat,
  sendLiveChatMessage,
  getLiveChatMessages,
  markLiveChatRead,
} from "../controllers/chat.controller.js";
import { chatRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/", chatRateLimiter, chatWithAssistant);

// Live Chat Serverless REST Endpoints
router.post("/live/join", joinLiveChat);
router.post("/live/send", sendLiveChatMessage);
router.get("/live/messages", getLiveChatMessages);
router.post("/live/mark-read", markLiveChatRead);

export default router;
