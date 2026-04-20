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

// ⚡ Webhook route must be defined before JSON middleware to access raw body
// app.post("/api/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook);
// console.log("Stripe Key Check:", process.env.STRIPE_SECRET_KEY)

// ✅ Regular routes use JSON parser
// Ye do lines zaroori hain
app.use(express.json()); // JSON data read karne ke liye
app.use(express.urlencoded({ extended: true })); // Form data read karne ke liye
app.use(cookieParser());

// ✅ Allow multiple frontend origins (Vercel + Localhost)
const allowedOrigins = [
  "http://localhost:3000", // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / Thunder Client
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS policy: Not allowed by server"), false);
      }
      return callback(null, true);
    },
    credentials: true,
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

export default app;
