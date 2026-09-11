// app/(shop)/category/[slug]/categoryView.tsx  (Server Component + helpers)
//
// Ye file /category/<slug> aur /category/<slug>/page/<n> DONO routes ke liye
// shared hai. Alag alag files mein duplicate karne ki bajaye ek hi jagah rakha
// hai, warna metadata/JSON-LD/breadcrumb do jagah maintain karne parte.
//
// Pagination alag route segment (/page/<n>) par hai, searchParams (?page=2)
// par NAHI: searchParams parhte hi Next poore route ko dynamic kar deta hai,
// yani category pages ki static HTML khatam ho jati aur har request backend
// tak jati. Alag segment se page 1 static rehti hai aur pages 2+ ISR se cache
// hoti hain.

import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryService } from "@/service/categoryService/category.service";
import { productService } from "@/service/productservice/product.service";
import CategoryClient from "./CategoryClient";
import CategoryFaq from "@/components/shop/share/CategoryFaq";
import RelatedGuides from "@/components/shop/share/RelatedGuides";

export const SITE_URL = "https://www.fancystore.store";
export const PAGE_SIZE = 12;

// Slug ko readable title bana deta hai jab registry mein entry na ho.
// NOTE: sirf `_` -> space kaafi nahi tha — purana code "car_topCover" ko
// "car topCover" dikhata tha. Ye camelCase bhi todta hai.
export const humanizeSlug = (slug: string) =>
  slug
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Page 1 ka URL saaf rehta hai; sirf 2+ par /page/<n> lagta hai. */
export const categoryPath = (slug: string, page: number) =>
  page <= 1 ? `/category/${slug}` : `/category/${slug}/page/${page}`;

// ============================================================
// METADATA
// ============================================================
export async function buildCategoryMetadata(
  slug: string,
  page: number
): Promise<Metadata> {
  // Page 2+ par products bhi mangwate hain sirf ye jaanne ke liye ke page
  // range mein hai ya nahi. Wajah: is app ke root par app/loading.tsx hai, is
  // liye har page turant stream hona shuru ho jata hai aur uske BAAD chalne
  // wala notFound() HTTP status 404 nahi kar pata — 404 wali UI 200 status ke
  // sath jati hai (soft 404). Metadata streaming se PEHLE resolve hoti hai, to
  // noindex yahan se lagana kaam karta hai aur out-of-range pages (e.g. stock
  // kam hone par purana /page/7) Google ke index mein nahi jatin.
  const [category, currentPage] = await Promise.all([
    categoryService.getBySlug(slug).catch(() => null),
    page > 1
      ? productService.getProductsByFilter(slug, {}, page, PAGE_SIZE).catch(() => null)
      : Promise.resolve(null),
  ]);

  const outOfRange = page > 1 && (currentPage?.products?.length ?? 0) === 0;
  const baseTitle = category?.title || humanizeSlug(slug);

  // Page 2+ ke title/description mein page number zaroori hai, warna saari
  // paginated pages ka title same hota hai aur GSC "Duplicate meta" report
  // karta hai.
  const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle;
  const baseDescription =
    category?.subtitle ||
    `Shop ${baseTitle} at Fancy Store. Premium quality car & bike accessories with fast delivery all over Pakistan.`;
  const description =
    page > 1 ? `${baseDescription} (Page ${page})` : baseDescription;

  // Har paginated page apna canonical khud hai. Isko page 1 par point karna
  // GALAT hai — phir pages 2+ ke products kabhi index nahi hote.
  const canonical = `${SITE_URL}${categoryPath(slug, page)}`;
  const ogImage = category?.image?.startsWith("http")
    ? category.image
    : `${SITE_URL}${category?.image || "/steeringCover_compressed.jpg"}`;

  return {
    // Sirf `title` — app/layout.tsx:81 ka template "%s | Fancy Store" khud
    // suffix laga deta hai. Yahan poora likhne se "Towels | Fancy Store |
    // Fancy Store" ban jata tha.
    title,
    description,
    ...(outOfRange ? { robots: { index: false, follow: false } } : {}),
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

// ============================================================
// PAGINATION NAV
// ============================================================
// Asli <a href> links jo JavaScript ke bagair chalte hain. Infinite scroll
// sirf users ke liye hai — Googlebot scroll nahi karta, is liye har page ka
// crawlable link hona zaroori hai warna page 1 ke 12 products ke ilawa poori
// category orphan reh jati hai.
const PaginationNav = ({
  slug,
  page,
  totalPages,
}: {
  slug: string;
  page: number;
  totalPages: number;
}) => {
  if (totalPages <= 1) return null;

  // Saare page numbers dikhane ki bajaye ek window — 50 pages par 50 links
  // bhadde lagte hain. Pehla aur aakhri hamesha shamil rehte hain taake
  // crawler do hop mein kisi bhi page tak pohanch jaye.
  const windowed = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = [...windowed]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const linkClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary";

  return (
    <nav
      aria-label="Category pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 && (
        <Link href={categoryPath(slug, page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      )}

      {pages.map((n, index) => {
        // Window mein gap ho to "..." dikhate hain (e.g. 1 ... 7 8 9 ... 20)
        const previous = pages[index - 1];
        const gap = previous !== undefined && n - previous > 1;

        return (
          <React.Fragment key={n}>
            {gap && (
              <span className="px-1 text-sm text-text-muted" aria-hidden="true">
                ...
              </span>
            )}
            {n === page ? (
              <span
                aria-current="page"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white"
              >
                {n}
              </span>
            ) : (
              <Link href={categoryPath(slug, n)} className={linkClass}>
                {n}
              </Link>
            )}
          </React.Fragment>
        );
      })}

      {page < totalPages && (
        <Link href={categoryPath(slug, page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      )}
    </nav>
  );
};

// ============================================================
// PAGE VIEW
// ============================================================
export default async function CategoryView({
  slug,
  page,
}: {
  slug: string;
  page: number;
}) {
  // ⚠️ .catch() dono pe MANDATORY hai — unhandled rejection `next build` ke
  // prerender step ko fail kar deta hai, aur phir deploy hi nahi hota.
  const [category, currentPage] = await Promise.all([
    categoryService.getBySlug(slug).catch(() => null),
    productService
      .getProductsByFilter(slug, {}, page, PAGE_SIZE)
      .catch(() => null),
  ]);

  const title = category?.title || humanizeSlug(slug);
  const products = currentPage?.products || [];
  const totalItems = currentPage?.totalItems ?? 0;
  const totalPages = currentPage?.totalPages ?? 1;

  // Registry mein bhi nahi mila aur products bhi nahi mile -> ye category
  // asal mein exist nahi karti. Real 404 do — pehle yeh 200 status ke sath
  // "category maujood nahi" div render karta tha, jo GSC "Soft 404" bana
  // raha tha.
  if (!category && !currentPage) {
    notFound();
  }

  // /page/99 jaisi URL jahan products hain hi nahi — 200 status par khali
  // grid dena GSC mein phir "Soft 404" banata hai.
  if (page > 1 && products.length === 0) {
    notFound();
  }

  const canonical = `${SITE_URL}${categoryPath(slug, page)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name:
          page > 1
            ? `${title} - Page ${page} | Fancy Store`
            : `${title} | Fancy Store`,
        description: category?.subtitle || `Shop ${title} at Fancy Store.`,
        url: canonical,
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
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-6 text-xs text-text-muted mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        {page > 1 ? (
          <>
            <Link
              href={`/category/${slug}`}
              className="hover:text-primary transition-colors"
            >
              {title}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-main">Page {page}</span>
          </>
        ) : (
          <span className="text-text-main">{title}</span>
        )}
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
          {page > 1 ? `${title} - Page ${page}` : title}
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

      {/* Ye page server se render hui hai (SEO ke liye), aage ki pages client pe */}
      <CategoryClient
        slug={slug}
        initialProducts={products}
        initialPage={page}
        initialTotalPages={totalPages}
        pageSize={PAGE_SIZE}
      />

      <PaginationNav slug={slug} page={page} totalPages={totalPages} />

      <RelatedGuides categorySlug={slug} />
      <CategoryFaq categorySlug={slug} />
    </div>
  );
}
