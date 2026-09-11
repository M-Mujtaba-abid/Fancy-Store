// app/(shop)/category/[slug]/page.tsx  (Server Component)
//
// Pehle category page /category?category=<slug> tha aur "use client" +
// useSearchParams use karta tha. Iska nateeja: prerendered HTML literally
// "Loading Shop..." hota tha — na <h1>, na product names, na per-category
// <title>. Yani 8 sab se high-intent commercial URLs Google ke liye khali thin.
//
// Ab ye Server Component hai: generateMetadata, generateStaticParams, aur
// products server pe render hote hain. Purani URL next.config.ts se 301 redirect
// ho jati hai, to koi purana link ya Google result nahi tootega.
//
// Asal rendering categoryView.tsx mein hai — wahi file pages 2+
// (/category/<slug>/page/<n>) bhi render karti hai.

// ⚠️ Ye page generateStaticParams use karta hai, yani build time pe static HTML
// ban jati hai. Iske BINA page hamesha wahi products dikhati rahegi jo build ke
// waqt DB mein the — naya product add karne pe category page purani hi rehti thi.
// (Value literal honi chahiye: Next isko statically analyze karta hai.)
export const revalidate = 300;

import { Metadata } from "next";
import { categoryService } from "@/service/categoryService/category.service";
import CategoryView, { buildCategoryMetadata } from "./categoryView";

// Build time pe saare category pages prerender karo. Naye categories baad mein
// on-demand render ho jayenge (dynamicParams default true hai).
export async function generateStaticParams() {
  const categories = await categoryService.getAll().catch(() => []);
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildCategoryMetadata(slug, 1);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryView slug={slug} page={1} />;
}
