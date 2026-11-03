import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// --- Public ---
router.get("/", getSettings);

// --- Admin ---
router.patch("/", authMiddleware, adminMiddleware, updateSettings);

export default router;
