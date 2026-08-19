import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "your-backend-app.vercel.app",
        pathname: "/**", // Pathname yahan bhi add kar dein safe side ke liye
      },
       // ✅ ADD THIS
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  // Category URLs /category?category=<slug> se /category/<slug> pe move hui hain
  // (SEO: query-string page pe generateMetadata possible nahi tha).
  // Permanent redirects se koi purana link, bookmark ya Google result nahi tootega.
  async redirects() {
    return [
      {
        source: "/category",
        has: [{ type: "query", key: "category", value: "(?<slug>.*)" }],
        destination: "/category/:slug",
        permanent: true,
      },
      // Bare /category (bina slug) -> saare products
      {
        source: "/category",
        destination: "/products",
        permanent: true,
      },
      // Teen legacy stub pages — inme placeholder text tha (aur bikeTopCover
      // ka <h1> galti se "Car Top Covers" kehta tha). Sitemap mein priority 0.8
      // pe listed thin duplicate pages the, jo asli category pages se compete
      // karte the.
      {
        source: "/carTopCover",
        destination: "/category/car_topCover",
        permanent: true,
      },
      {
        source: "/bikeTopCover",
        destination: "/category/bike_topCover",
        permanent: true,
      },
      {
        source: "/truncTrayMat",
        destination: "/category/trunk_tray",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;