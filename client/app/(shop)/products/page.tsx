// app/(shop)/products/page.tsx  (Server Component)
//
// Pehle ye ek plain server component tha jo sirf <ProductsClient /> render
// karta tha, aur wo client component saara data react-query se client pe
// laata tha. Nateeja: is page ki server HTML mein "Loading" ke ilawa kuch
// nahi hota tha — product ka ek bhi <a href="/products/..."> link nahi.
// Googlebot ke liye site ka sab se bara listing page bilkul khali tha.
//
// Ab page 1 server pe render hoti hai (12 products ke asli links) aur us ke
// upar saari categories ke links bhi server HTML mein jate hain, jis se har
// category page tak crawl ka raasta khul jata hai.

// ⚠️ Literal value honi chahiye — Next isko statically analyze karta hai.
// Iske bagair naya product add karne pe ye page build waqt wali HTML hi
// dikhati rehti.
export const revalidate = 300;

import { Metadata } from "next";
import Link from "next/link";
import { productService } from "@/service/productservice/product.service";
import { categoryService } from "@/service/categoryService/category.service";
import ProductsClient from "./ProductsClient";

const PAGE_SIZE = 12;

// Slug ko readable label bana deta hai jab category ka apna title na ho.
// Sirf `_` -> space kaafi nahi — "car_topCover" ko camelCase pe bhi torna
// parta hai warna "Car Topcover" ki jagah "Car TopCover" jaisa labels aate hain.
const humanizeSlug = (slug: string) =>
  slug
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ==========================================
// 🌟 SEO METADATA FOR ALL PRODUCTS PAGE
// ==========================================
export const metadata: Metadata = {
  // Sirf title — app/layout.tsx:81 ka template " | Fancy Store" khud jorta
  // hai. Poora likhne se "All Products | Fancy Store | Fancy Store" banta tha.
  title: "All Car & Bike Accessories",
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

export default async function ProductsPage() {
  // ⚠️ .catch() dono pe MANDATORY hai — unhandled rejection `next build` ke
  // prerender step ko fail kar deta hai, aur phir deploy hi nahi hota.
  const [firstPage, categories] = await Promise.all([
    productService.getAllProducts(1, PAGE_SIZE).catch(() => null),
    categoryService.getAll().catch(() => []),
  ]);

  return (
    <div className="min-h-screen pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header — pehle ye client component ke andar tha, yani server
          HTML mein <h1> bhi nahi tha. */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main">
          All Products
        </h1>
        <div className="h-1 w-16 bg-primary mt-3"></div>
      </div>

      {/* Shop by category — ye links server HTML ka hissa hain, is liye
          Googlebot yahan se har category page tak pohanch jata hai (aur
          wahan se pagination ke zariye har product tak). */}
      {categories.length > 0 && (
        <nav aria-label="Shop by category" className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-3">
            Shop by category
          </h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium text-text-main transition-colors hover:border-primary hover:text-primary"
                >
                  {category.title || humanizeSlug(category.slug)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Page 1 server se aayi hai (SEO ke liye), aage ki pages client pe */}
      <ProductsClient
        initialProducts={firstPage?.products || []}
        initialTotalPages={firstPage?.totalPages ?? 1}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
