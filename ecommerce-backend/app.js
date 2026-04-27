import express from "express";
import { dbConnection } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import searchRoutes from "./routes/search.routes.js";
import contactRoutes from "./routes/contact.route.js";
import reviewRoutes from "./routes/review.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import { stripeWebhook } from "./controllers/payment.controller.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/error.middleware.js";
import cors from "cors";

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// ⚡ CHANGE 1: Production (Vercel) URL aur Localhost dono ko allow karein
const allowedOrigins = [
  "http://localhost:3000", // local dev
  process.env.FRONTEND_URL // Vercel dashboard mein frontend ka live URL yahan set karna hoga
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); 
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS policy: Not allowed by server"), false);
      }
      return callback(null, true);
    },
    credentials: true, // Cookies frontend tak bhejne ke liye zaroori hai
  }),
);

// ✅ Routes
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);

dbConnection();
app.use(errorHandler);

// ⚡ CHANGE 2: Local server listener add karein
// Vercel par NODE_ENV default 'production' hota hai, to ye block wahan nahi chalega
// Sirf local par chalega taake port par app listen kar sake
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

// Vercel serverless functions ke liye export karna zaroori hai
export default app;