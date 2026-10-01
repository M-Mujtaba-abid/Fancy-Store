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
//
// Aur 6 ghante jaan bujh kar hain, wapas chhota mat karna.
//
// Ye value pehle 300 (5 minute) thi. Har stale request ek ISR write banti
// hai, aur site par ~50 aise cached URLs hain. 50 x 288 writes/din =
// ~430K/mahina, jo Vercel ki free limit (200K) se do guna zyada tha. CPU bhi
// isi se jal rahi thi, kyunke har regeneration backend ki kai calls karti hai.
//
// 6 ghante mehfooz is liye hai ke admin se product add/edit karte hi ye page
// foran purge ho jata hai - dekho utils/revalidate.ts ka revalidateForProduct().
// Timer sirf un cheezon par lagta hai jo admin se nahi badaltin, jaise order
// se ghatne wala stock, aur wo bhi khatarnak nahi kyunke order lagate waqt
// backend khud stock check karta hai.
export const revalidate = 21600;

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
