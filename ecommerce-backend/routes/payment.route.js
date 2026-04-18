
import express from "express";
import { createCheckoutSession, stripeWebhook, verifySession } from "../controllers/payment.controller.js";
const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

// webhook uses raw body
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// verify payment session
router.get("/verify-session", verifySession);

export default router;
