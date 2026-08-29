import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { productService } from "@/service/productservice/product.service";
import { categoryService } from "@/service/categoryService/category.service";
import ProductCard from "@/components/shop/share/ProductCard";
import type { Product } from "@/types/product.type";
import type { Category } from "@/types/category.type";

interface RelatedShopLinksProps {
  productSlugs: string[] | null;
  categorySlugs: string[] | null;
}

/**
 * Async Server Component. Each related product/category gets its own
 * `.catch()` and is filtered out on failure. A deleted product or category
 * should never 404 or 500 the whole article; it should just quietly
 * disappear from the strip. That's why relatedProductSlugs/relatedCategorySlugs
 * have no foreign key, only plain slug strings.
 */
const RelatedShopLinks = async ({ productSlugs, categorySlugs }: RelatedShopLinksProps) => {
  const [products, categories] = await Promise.all([
    Promise.all(
      (productSlugs || []).map((slug) =>
        productService.getProductById(slug).catch(() => null)
      )
    ),
    Promise.all(
      (categorySlugs || []).map((slug) => categoryService.getBySlug(slug).catch(() => null))
    ),
  ]);

  const validProducts = products.filter(Boolean) as Product[];
  const validCategories = categories.filter(Boolean) as Category[];

  if (validProducts.length === 0 && validCategories.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold text-text-main mb-6">Shop this guide</h2>

      {validProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {validProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}

      {validCategories.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {validCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="flex items-center gap-2 bg-card border border-border rounded-full pl-1.5 pr-4 py-1.5 hover:border-primary transition-colors"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-background shrink-0">
                {c.image ? (
                  <Image src={c.image} alt={c.title} fill className="object-cover" sizes="32px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff size={12} className="text-text-muted/50" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-text-main">{c.title}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default RelatedShopLinks;
