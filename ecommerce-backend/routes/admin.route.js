import express from "express";
import { getDashboardStats, getProfitSummary, getSalesChart, getLowStockProducts, getAllUsers, getChatRooms, getRoomMessages, markRoomAsRead, deleteChatRoom } from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats);
router.get("/dashboard/profit-summary", authMiddleware, adminMiddleware, getProfitSummary);
router.get("/dashboard/sales-chart", authMiddleware, adminMiddleware, getSalesChart);
router.get("/dashboard/low-stock", authMiddleware, adminMiddleware, getLowStockProducts);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/chat/rooms", authMiddleware, adminMiddleware, getChatRooms);
router.get("/chat/rooms/:roomId/messages", authMiddleware, adminMiddleware, getRoomMessages);
router.patch("/chat/rooms/:roomId/read", authMiddleware, adminMiddleware, markRoomAsRead);
router.delete("/chat/rooms/:roomId", authMiddleware, adminMiddleware, deleteChatRoom);

export default router;
