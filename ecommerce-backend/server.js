import { httpServer } from "./app.js";

// Vercel serverless: export the Express app (do not call listen)
export default httpServer;

// Local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server & Socket.IO running on port ${PORT}`);
  });
}
