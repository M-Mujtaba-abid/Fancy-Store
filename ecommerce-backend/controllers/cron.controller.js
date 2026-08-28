import { runAutoReviewSeeder } from "../services/autoReviewSeeder.service.js";

export const autoSeedReviewsCron = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const result = await runAutoReviewSeeder();
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Cron auto-seed failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
