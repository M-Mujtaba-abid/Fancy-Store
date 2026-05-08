// app/(shop)/products/page.tsx

import { Metadata } from "next";
import ProductsClient from "./ProductsClient";

// ==========================================
// 🌟 SEO METADATA FOR ALL PRODUCTS PAGE
// ==========================================
export const metadata: Metadata = {
  title: "All Products | Fancy Store",
  description: "Browse our huge collection of premium car accessories, top covers, and dashboard mats at Fancy Store. Find exactly what you need with fast shipping.",
  alternates: {
    canonical: "https://www.fancystore.store/products",
  },
  openGraph: {
    title: "Shop All Car Accessories | Fancy Store",
    description: "Browse our huge collection of premium car accessories and dashboard mats.",
    url: "https://www.fancystore.store/products",
    siteName: "Fancy Store",
    images: [
      {
        url: "https://www.fancystore.store/steeringCover_compressed.jpg",
        width: 1200,
        height: 630,
        alt: "Shop Fancy Store Products",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Car Accessories | Fancy Store",
    description: "Browse our huge collection of premium car accessories and dashboard mats.",
    images: ["https://www.fancystore.store/steeringCover_compressed.jpg"],
  },
};

export default function ProductsPage() {
  return (
    <>
      {/* Aapka client component jo API aur pagination handle karega */}
      <ProductsClient />
    </>
  );
}