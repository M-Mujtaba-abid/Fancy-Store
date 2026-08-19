import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { dbConnection } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import categoryRoutes from "./routes/category.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import searchRoutes from "./routes/search.routes.js";
import contactRoutes from "./routes/contact.route.js";
import reviewRoutes from "./routes/review.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import chatRoutes from "./routes/chat.route.js";
import adminRoutes from "./routes/admin.route.js";

import { stripeWebhook } from "./controllers/payment.controller.js";
import errorHandler from "./middleware/error.middleware.js";
import { initializeSocket } from "./socket/socketHandler.js";

const app = express();

const PORT = process.env.PORT || 5000;

// CORS

const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");

const baseAllowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
]
  .map((origin) => normalizeOrigin(origin?.trim()))
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set(
    baseAllowedOrigins.flatMap((origin) => {
      try {
        const parsed = new URL(origin);

        if (parsed.hostname.startsWith("www.")) {
          return [
            origin,
            `${parsed.protocol}//${parsed.hostname.replace("www.", "")}`,
          ];
        }

        if (!parsed.hostname.startsWith("localhost")) {
          return [
            origin,
            `${parsed.protocol}//www.${parsed.hostname}`,
          ];
        }
      } catch {
        return [origin];
      }

      return [origin];
    })
  )
);

// ----------------------------------
// Stripe Webhook

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Global Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);

      if (!allowedOrigins.includes(normalizedOrigin)) {
        return callback(
          new Error("CORS policy: Not allowed by server"),
          false
        );
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

// HTTP + Socket.IO Server
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

initializeSocket(io);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Hello Fancy Store!");
});
// Error Handler


app.use(errorHandler);
// Database Connection
dbConnection();

export { app, httpServer };
export default app;