import rateLimit from "express-rate-limit";

// Chat ke liye specific rate limiter banayein
export const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute ka window
  max: 7, // 1 minute mein maximum 7 messages allow honge
  message: {
    success: false,
    message: "Agent is busy due to high traffic please hold on."
  },
  standardHeaders: true, // Rate limit info `RateLimit-*` headers mein bhejein
  legacyHeaders: false, // `X-RateLimit-*` headers disable karein
});

// Ab is limiter ko apne chat route par laga dein
// Example: router.post("/chat", chatRateLimiter, chatController);