// app/(shop)/blog/page.tsx (Server Component) — listing
import { Metadata } from "next";
import Link from "next/link";
import { blogService } from "@/service/blogService/blog.service";
import BlogListClient from "./BlogListClient";

export const revalidate = 300;

const SITE_URL = "https://www.fancystore.store";
const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Buying guides and articles on car & bike accessories — covers, mats, and more — from Fancy Store.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog | Fancy Store",
    description: "Buying guides and articles on car & bike accessories from Fancy Store.",
    url: `${SITE_URL}/blog`,
    siteName: "Fancy Store",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Fancy Store",
    description: "Buying guides and articles on car & bike accessories from Fancy Store.",
  },
};

export default async function BlogIndexPage() {
  // ⚠️ .catch() mandatory — unhandled rejection fails next build's prerender step
  const firstPage = await blogService.getPublished(1, PAGE_SIZE).catch(() => null);
  const posts = firstPage?.posts || [];
  const totalPages = firstPage?.totalPages ?? 1;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: "Fancy Store Blog",
        url: `${SITE_URL}/blog`,
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.publishedAt,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
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

      <nav className="text-xs text-text-muted mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-main">Blog</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">Blog</h1>
        <p className="mt-2 text-text-muted">
          Buying guides and tips for car & bike accessories.
        </p>
        <div className="h-1 w-20 bg-primary mt-4 rounded-full" />
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-text-muted">New posts are coming soon.</p>
        </div>
      ) : (
        <BlogListClient initialPosts={posts} initialTotalPages={totalPages} pageSize={PAGE_SIZE} />
      )}
    </div>
  );
}
