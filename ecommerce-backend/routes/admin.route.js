import express from "express";
import { getDashboardStats, getAllUsers, getChatRooms, getRoomMessages, markRoomAsRead } from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/chat/rooms", authMiddleware, adminMiddleware, getChatRooms);
router.get("/chat/rooms/:roomId/messages", authMiddleware, adminMiddleware, getRoomMessages);
router.patch("/chat/rooms/:roomId/read", authMiddleware, adminMiddleware, markRoomAsRead);

export default router;
