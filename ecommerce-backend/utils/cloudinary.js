import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// console.log("Cloudinary ENV Check:", {
//   CLOUD_NAME: process.env.CLOUD_NAME,
//   CLOUD_API_KEY: process.env.CLOUD_API_KEY,
//   CLOUD_API_SECRET: process.env.CLOUD_API_SECRET ? "✅ Loaded" : "❌ Missing",
// });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;
