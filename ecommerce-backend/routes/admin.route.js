import express from "express";
import { getDashboardStats, getAllUsers } from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

export default router;
