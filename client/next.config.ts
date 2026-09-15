import path from "path";
import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

/**
 * Archive kiye gaye duplicate products ki purani URLs -> keeper product.
 *
 * Ye file backend ki scripts/archiveDuplicateProducts.js likhti hai. Hum isko
 * JSON import ki bajaye fs se parhte hain taake file na hone par bhi build na
 * toote (fresh clone, ya script abhi tak chali hi na ho).
 *
 * Redirects yahan (next.config) mein hain, middleware mein NAHI: yahan ye edge
 * par handle hote hain, har request par koi function nahi chalta, aur status
 * asli permanent (308) hota hai. Middleware mein daalne ka koi faida nahi tha.
 */
type ProductRedirect = { from: string; to: string };

const loadProductRedirects = (): ProductRedirect[] => {
  try {
    const file = path.join(process.cwd(), "config", "productRedirects.json");
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (!Array.isArray(parsed)) return [];
    // Sirf poori tarah valid entries. Aadhi entry se `source`/`destination`
    // undefined ho jata hai aur `next build` waheen fail ho jati hai.
    return parsed.filter(
      (entry): entry is ProductRedirect =>
        Boolean(entry) &&
        typeof entry.from === "string" &&
        typeof entry.to === "string" &&
        entry.from.length > 0 &&
        entry.to.length > 0 &&
        entry.from !== entry.to
    );
  } catch {
    return [];
  }
};

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
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

  // Baseline security headers. No Content-Security-Policy here on purpose —
  // this site loads Google Analytics, Meta Pixel, TikTok Pixel, Google
  // Fonts, and Cloudinary images; a CSP would need every one of those
  // origins allowlisted first, and getting that wrong on a live site breaks
  // real functionality (broken images, broken analytics, broken payment
  // flows). The headers below are safe defaults that don't depend on
  // knowing every third-party origin in advance.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // Category URLs /category?category=<slug> se /category/<slug> pe move hui hain
  // (SEO: query-string page pe generateMetadata possible nahi tha).
  // Permanent redirects se koi purana link, bookmark ya Google result nahi tootega.
  async redirects() {
    return [
      // Archive kiye gaye duplicate products. Purani URL par aane wala har
      // customer aur crawler keeper product par chala jata hai, aur Google
      // dono URLs ke signals keeper par jama kar deta hai.
      ...loadProductRedirects().map((entry) => ({
        source: `/products/${entry.from}`,
        destination: `/products/${entry.to}`,
        permanent: true,
      })),
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