import express from "express";
import { autoSeedReviewsCron } from "../controllers/cron.controller.js";

const router = express.Router();

// Vercel Cron only issues GET requests; auth is done via CRON_SECRET header
// check inside the controller, not authMiddleware (no logged-in user here).
router.get("/auto-seed-reviews", autoSeedReviewsCron);

export default router;
