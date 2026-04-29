import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'your-backend-app.vercel.app', // Agar backend se images aa rahi hain
      }
    ],
  },
};

export default nextConfig;
