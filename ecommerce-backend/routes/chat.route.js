import express from "express";
import { chatWithAssistant } from "../controllers/chat.controller.js";
import { chatRateLimiter } from "../middleware/rateLimit.middleware.js";
const router = express.Router();

router.post("/", chatRateLimiter, chatWithAssistant);

export default router;
