// app/(shop)/products/productsView.tsx  (Server Component + helpers)
//
// Ye file /products aur /products/page/<n> DONO routes ke liye shared hai —
// bilkul wahi tarteeb jo category ki taraf categoryView.tsx par hai. Alag alag
// files mein duplicate karne se metadata/JSON-LD/breadcrumb do jagah maintain
// karne parte.
//
// Kyun banana pari: /products par sirf page 1 ke 12 products server HTML mein
// jate the aur baaki infinite scroll par the. Googlebot scroll nahi karta, is
// liye is listing se sirf 12 products crawlable the. Category pages par ye
// masla PaginationNav se theek ho chuka tha, magar /products — jo site ka sab
// se bara listing page hai — wese ka wesa reh gaya tha.
//
// Pagination alag route segment (/page/<n>) par hai, searchParams (?page=2)
// par NAHI: searchParams parhte hi Next poore route ko dynamic kar deta hai,
// yani page 1 ki static HTML khatam ho jati aur har request backend tak jati.

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productService } from "@/service/productservice/product.service";
import { categoryService } from "@/service/categoryService/category.service";
import PaginationNav from "@/components/shop/share/PaginationNav";
import ProductsClient from "./ProductsClient";

export const SITE_URL = "https://www.fancystore.store";
export const PAGE_SIZE = 12;

/** Page 1 ka URL saaf rehta hai; sirf 2+ par /page/<n> lagta hai. */
export const productsPath = (page: number) =>
  page <= 1 ? "/products" : `/products/page/${page}`;

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

// ============================================================
// METADATA
// ============================================================
export async function buildProductsMetadata(page: number): Promise<Metadata> {
  // Page 2+ par products bhi mangwate hain sirf ye jaanne ke liye ke page range
  // mein hai ya nahi. Wajah: is app ke root par app/loading.tsx hai, is liye har
  // page turant stream hona shuru ho jata hai aur uske BAAD chalne wala
  // notFound() HTTP status 404 nahi kar pata — 404 wali UI 200 status ke sath
  // jati hai (soft 404). Metadata streaming se PEHLE resolve hoti hai, to
  // noindex yahan se lagana kaam karta hai.
  const currentPage =
    page > 1
      ? await productService.getAllProducts(page, PAGE_SIZE).catch(() => null)
      : null;

  const outOfRange = page > 1 && (currentPage?.products?.length ?? 0) === 0;

  // Page 2+ ke title/description mein page number zaroori hai, warna saari
  // paginated pages ka title same hota hai aur GSC "Duplicate meta" report
  // karta hai.
  const baseTitle = "All Car & Bike Accessories";
  const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle;
  const baseDescription =
    "Browse our huge collection of premium car accessories, top covers, and dashboard mats at Fancy Store. Find exactly what you need with fast shipping.";
  const description = page > 1 ? `${baseDescription} (Page ${page})` : baseDescription;

  // Har paginated page apna canonical khud hai. Isko page 1 par point karna
  // GALAT hai — phir pages 2+ ke products kabhi index nahi hote.
  const canonical = `${SITE_URL}${productsPath(page)}`;
  const ogImage = `${SITE_URL}/steeringCover_compressed.jpg`;

  return {
    // Sirf `title` — app/layout.tsx ka template "%s | Fancy Store" khud suffix
    // laga deta hai. Yahan poora likhne se "... | Fancy Store | Fancy Store"
    // ban jata tha.
    title,
    description,
    ...(outOfRange ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical },
    openGraph: {
      title: `Shop All Car Accessories | Fancy Store`,
      description,
      url: canonical,
      siteName: "Fancy Store",
      type: "website",
      locale: "en_PK",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Shop Fancy Store Products",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop All Car Accessories | Fancy Store`,
      description,
      images: [ogImage],
    },
  };
}

// ============================================================
// PAGE VIEW
// ============================================================
export default async function ProductsView({ page }: { page: number }) {
  // ⚠️ .catch() dono pe MANDATORY hai — unhandled rejection `next build` ke
  // prerender step ko fail kar deta hai, aur phir deploy hi nahi hota.
  const [currentPage, allCategories] = await Promise.all([
    productService.getAllProducts(page, PAGE_SIZE).catch(() => null),
    categoryService.getAll().catch(() => []),
  ]);

  // Khali categories link nahi karte: unka page sirf "This Category is Coming
  // soon..." dikhata hai, wo bhi 200 status ke sath — Google ke liye soft 404.
  // Neeche wali nav ka poora maqsad crawl path banana hai, to us mein aisi
  // pages daalna ulta nuqsan hai. (productCount undefined = backend ne count
  // nahi bheja; aise mein link rehne dete hain.)
  const categories = allCategories.filter((c) => c.productCount !== 0);

  const products = currentPage?.products || [];
  const totalItems = currentPage?.totalItems ?? 0;
  const totalPages = currentPage?.totalPages ?? 1;

  // /page/99 jaisi URL jahan products hain hi nahi — 200 status par khali grid
  // dena GSC mein "Soft 404" banata hai. (Page 1 par notFound() NAHI karte:
  // khali catalog ya ek lamhe ki backend kharabi se poora /products 404 ho
  // jana bohot bara nuqsan hai.)
  if (page > 1 && products.length === 0) {
    notFound();
  }

  const canonical = `${SITE_URL}${productsPath(page)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name:
          page > 1
            ? `All Products - Page ${page} | Fancy Store`
            : "All Products | Fancy Store",
        description: "Premium car & bike accessories at Fancy Store.",
        url: canonical,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "All Products",
            item: `${SITE_URL}/products`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {page > 1 ? (
          <>
            <Link href="/products" className="hover:text-primary transition-colors">
              All Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-main">Page {page}</span>
          </>
        ) : (
          <span className="text-text-main">All Products</span>
        )}
      </nav>

      {/* Page Header — pehle ye client component ke andar tha, yani server
          HTML mein <h1> bhi nahi tha. */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main">
          {page > 1 ? `All Products - Page ${page}` : "All Products"}
        </h1>
        {totalItems > 0 && (
          <p className="mt-2 text-sm text-text-muted">
            {totalItems} {totalItems === 1 ? "product" : "products"}
          </p>
        )}
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

      {/* Ye page server se render hui hai (SEO ke liye), aage ki pages client pe */}
      <ProductsClient
        initialProducts={products}
        initialPage={page}
        initialTotalPages={totalPages}
        pageSize={PAGE_SIZE}
      />

      <PaginationNav
        page={page}
        totalPages={totalPages}
        href={productsPath}
        label="Products pagination"
      />
    </div>
  );
}
