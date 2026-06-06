import express from "express";
import { placeOrder, getOrders, getAllOrders, getOrdersCount, updateOrderStatus } from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/", optionalAuthMiddleware, placeOrder);

router.use(authMiddleware);
router.get("/", getOrders);
router.get("/all", adminMiddleware, getAllOrders); // Admin: get all orders
router.get("/count", adminMiddleware, getOrdersCount); // Admin: orders count
router.patch("/:id/status", adminMiddleware, updateOrderStatus); // Admin: update status

export default router;
