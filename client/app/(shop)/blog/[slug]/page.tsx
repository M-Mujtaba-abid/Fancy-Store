// app/(shop)/blog/[slug]/page.tsx (Server Component) — detail
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogService } from "@/service/blogService/blog.service";
import RelatedShopLinks from "@/components/shop/blog/RelatedShopLinks";

export const revalidate = 300;

const SITE_URL = "https://www.fancystore.store";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function readingTime(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Prerender all published posts at build time. Newer posts render
// on-demand later (dynamicParams defaults to true).
export async function generateStaticParams() {
  const page = await blogService.getPublished(1, 200).catch(() => null);
  return (page?.posts ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogService.getBySlug(slug).catch(() => null);

  if (!post) return { title: "Post Not Found" };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || stripHtml(post.body).slice(0, 160);
  const canonical = `${SITE_URL}/blog/${slug}`;
  const ogImage = post.coverImage || `${SITE_URL}/logoB.png`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Fancy Store",
      type: "article",
      locale: "en_PK",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.coverImageAlt || title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await blogService.getBySlug(slug).catch(() => null);

  // Backend already 404s drafts/missing slugs — real 404, never a 200
  // "not found" div.
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
        headline: post.title.slice(0, 110),
        description: post.metaDescription || post.excerpt || undefined,
        image: post.coverImage || undefined,
        datePublished: post.publishedAt || undefined,
        dateModified: post.updatedAt,
        author: { "@type": "Person", name: post.author },
        publisher: {
          "@type": "Organization",
          name: "Fancy Store",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/logoB.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen pt-12 pb-16 max-w-3xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-text-muted mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-main line-clamp-1">{post.title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
          {post.title}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
          <span>{post.author}</span>
          {post.publishedAt && (
            <>
              <span>•</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </>
          )}
          <span>•</span>
          <span>{readingTime(post.body)} min read</span>
        </div>
      </header>

      {post.coverImage && (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-background">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Admin-authored HTML — same trust level as product descriptions
          (components/shop/share/ExpandableDescription.tsx), which already
          render this way. Only auth+adminMiddleware-gated users can write it. */}
      <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.body }} />

      <RelatedShopLinks
        productSlugs={post.relatedProductSlugs}
        categorySlugs={post.relatedCategorySlugs}
      />

      <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3">
        <Link
          href="/blog"
          className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:border-primary transition-colors"
        >
          ← Back to Blog
        </Link>
        <Link
          href="/products"
          className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Browse All Products
        </Link>
      </div>
    </div>
  );
}
