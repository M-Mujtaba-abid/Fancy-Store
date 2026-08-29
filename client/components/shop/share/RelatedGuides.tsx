import Link from "next/link";
import { BookOpen } from "lucide-react";
import { blogService } from "@/service/blogService/blog.service";

interface RelatedGuidesProps {
  productSlug?: string;
  categorySlug?: string;
}

const MAX_GUIDES = 2;

/**
 * Blog posts link to products/categories via relatedProductSlugs/
 * relatedCategorySlugs (see RelatedShopLinks.tsx for the other direction).
 * This closes the loop: a product or category page links back to any blog
 * post that references it, so link equity and topical relevance flow both
 * ways instead of only blog -> product.
 *
 * No dedicated backend query for this yet — post volume is small enough
 * (a few dozen at most) that fetching the published list and filtering in
 * JS here is simpler and fast enough. Revisit with a real query if the
 * blog grows into the hundreds.
 */
const RelatedGuides = async ({ productSlug, categorySlug }: RelatedGuidesProps) => {
  if (!productSlug && !categorySlug) return null;

  const page = await blogService.getPublished(1, 100).catch(() => null);
  const posts = page?.posts || [];

  const matches = posts
    .filter(
      (post) =>
        (productSlug && post.relatedProductSlugs?.includes(productSlug)) ||
        (categorySlug && post.relatedCategorySlugs?.includes(categorySlug))
    )
    .slice(0, MAX_GUIDES);

  if (matches.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-2">
        {matches.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:border-primary transition-colors"
          >
            <BookOpen size={18} className="text-primary shrink-0" />
            <span className="text-sm">
              <span className="text-text-muted">Buying guide: </span>
              <span className="font-medium text-text-main">{post.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedGuides;
