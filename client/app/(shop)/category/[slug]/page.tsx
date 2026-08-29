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

// ⚠️ Ye page generateStaticParams use karta hai, yani build time pe static HTML
// ban jati hai. Iske BINA page hamesha wahi products dikhati rahegi jo build ke
// waqt DB mein the — naya product add karne pe category page purani hi rehti thi.
// (Value literal honi chahiye: Next isko statically analyze karta hai.)
export const revalidate = 300;

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryService } from "@/service/categoryService/category.service";
import { productService } from "@/service/productservice/product.service";
import CategoryClient from "./CategoryClient";
import CategoryFaq from "@/components/shop/share/CategoryFaq";
import RelatedGuides from "@/components/shop/share/RelatedGuides";

const SITE_URL = "https://www.fancystore.store";
const PAGE_SIZE = 12;

// Slug ko readable title bana deta hai jab registry mein entry na ho.
// NOTE: sirf `_` -> space kaafi nahi tha — purana code "car_topCover" ko
// "car topCover" dikhata tha. Ye camelCase bhi todta hai.
const humanizeSlug = (slug: string) =>
  slug
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

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

  const category = await categoryService.getBySlug(slug).catch(() => null);
  const title = category?.title || humanizeSlug(slug);
  const description =
    category?.subtitle ||
    `Shop ${title} at Fancy Store. Premium quality car & bike accessories with fast delivery all over Pakistan.`;
  const canonical = `${SITE_URL}/category/${slug}`;
  const ogImage = category?.image?.startsWith("http")
    ? category.image
    : `${SITE_URL}${category?.image || "/steeringCover_compressed.jpg"}`;

  return {
    // Sirf `title` — app/layout.tsx:81 ka template "%s | Fancy Store" khud
    // suffix laga deta hai. Yahan poora likhne se "Towels | Fancy Store |
    // Fancy Store" ban jata tha.
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Fancy Store`,
      description,
      url: canonical,
      siteName: "Fancy Store",
      type: "website",
      locale: "en_PK",
      images: [{ url: ogImage, width: 1080, height: 1080, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Fancy Store`,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ⚠️ .catch() dono pe MANDATORY hai — unhandled rejection `next build` ke
  // prerender step ko fail kar deta hai, aur phir deploy hi nahi hota.
  const [category, firstPage] = await Promise.all([
    categoryService.getBySlug(slug).catch(() => null),
    productService
      .getProductsByFilter(slug, {}, 1, PAGE_SIZE)
      .catch(() => null),
  ]);

  const title = category?.title || humanizeSlug(slug);
  const products = firstPage?.products || [];
  const totalItems = firstPage?.totalItems ?? 0;
  const totalPages = firstPage?.totalPages ?? 1;

  // Registry mein bhi nahi mila aur products bhi nahi mile -> ye category
  // asal mein exist nahi karti. Real 404 do — pehle yeh 200 status ke sath
  // "category maujood nahi" div render karta tha, jo GSC "Soft 404" bana
  // raha tha.
  if (!category && !firstPage) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${title} | Fancy Store`,
        description: category?.subtitle || `Shop ${title} at Fancy Store.`,
        url: `${SITE_URL}/category/${slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: `${SITE_URL}/category/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen pt-12 pb-12 max-w-7xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-text-muted mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-main">{title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
          {title}
        </h1>
        {category?.subtitle && (
          <p className="mt-2 text-text-muted">{category.subtitle}</p>
        )}
        {totalItems > 0 && (
          <p className="mt-2 text-sm text-text-muted">
            {totalItems} {totalItems === 1 ? "product" : "products"}
          </p>
        )}
        <div className="h-1 w-20 bg-primary mt-4 rounded-full" />
      </header>

      {/* Page 1 server se render hui hai (SEO ke liye), aage ki pages client pe */}
      <CategoryClient
        slug={slug}
        initialProducts={products}
        initialTotalPages={totalPages}
        pageSize={PAGE_SIZE}
      />

      <RelatedGuides categorySlug={slug} />
      <CategoryFaq categorySlug={slug} />
    </div>
  );
}
