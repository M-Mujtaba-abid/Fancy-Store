import express from "express";
import { chatWithAssistant } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", chatWithAssistant);

export default router;
