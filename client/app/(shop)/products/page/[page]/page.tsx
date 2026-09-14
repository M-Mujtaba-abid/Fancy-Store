// app/(shop)/products/page/[page]/page.tsx  (Server Component)
//
// /products ki pages 2, 3, 4... — /products/page/2
//
// Ye route SEO ke liye hai. /products par products infinite scroll se aate
// hain, aur Googlebot scroll nahi karta: page 1 ke 12 products ke ilawa site
// ke sab se bare listing page se koi crawlable raasta nahi tha. Category
// pages par yehi cheez pehle theek ho chuki hai
// (app/(shop)/category/[slug]/page/[page]/page.tsx).
//
// NOTE: `page` yahan ek static segment hai jo /products/[id] se pehle match
// hota hai (Next mein static segment hamesha dynamic par bhari hai). Yani
// "page" naam ka koi product slug kaam nahi karega — amalan aisa slug banta
// nahi.
export const revalidate = 300;

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductsView, { buildProductsMetadata } from "../../productsView";

// Khali array jaan bujh kar: build time pe koi page prerender nahi karte
// (product counts roz badalte hain), lekin generateStaticParams ka HONA zaroori
// hai. Iske bagair Next is route ko poori tarah dynamic samajhta hai aur har
// crawl request backend tak jati hai. Iske sath route SSG ban jata hai: pehli
// request pe render, phir `revalidate` ke hisaab se cache.
export async function generateStaticParams() {
  return [];
}

/**
 * "2" -> 2. Sirf plain positive integers qubool hain.
 *
 * "/page/01", "/page/2abc" ya "/page/-1" jaisi URLs ko parseInt chup chaap
 * accept kar leta hai, jis se ek hi content ke kai URLs ban jate (duplicate
 * content). Aur "/page/1" ko bhi reject karte hain — page 1 ka canonical URL
 * /products hai.
 */
const parsePageParam = (value: string): number | null => {
  if (!/^[1-9][0-9]*$/.test(value)) return null;
  const page = Number(value);
  return page > 1 ? page : null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = parsePageParam(page);
  // Neeche wala notFound() 404 UI to dikha deta hai magar HTTP status 200 hi
  // rehta hai (root app/loading.tsx ki wajah se response pehle hi stream ho
  // chuka hota hai). Is liye noindex zaroori hai, warna ye soft 404 pages
  // Google ke index mein chali jati hain.
  if (!pageNumber) return { robots: { index: false, follow: false } };
  return buildProductsMetadata(pageNumber);
}

export default async function ProductsPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = parsePageParam(page);

  if (!pageNumber) {
    notFound();
  }

  return <ProductsView page={pageNumber} />;
}
