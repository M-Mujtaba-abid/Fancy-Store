import express from "express";
import {
  toggleWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware); // sab routes protected

router.post("/toggle", toggleWishlist);  // add/remove
router.get("/", getWishlist);            // wishlist dekho

export default router;