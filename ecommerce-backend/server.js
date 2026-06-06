import app from "./app.js";

// Vercel serverless: export the Express app (do not call listen)
export default app;

// Local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
