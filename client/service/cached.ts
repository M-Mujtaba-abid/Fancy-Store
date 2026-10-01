import { cache } from "react";
import { productService } from "@/service/productservice/product.service";
import { categoryService } from "@/service/categoryService/category.service";
import { blogService } from "@/service/blogService/blog.service";

/**
 * Server components ke liye de-duplicated service calls.
 *
 * ⚠️ Masla kya tha
 *
 * Next `fetch()` ko khud dedupe karta hai, magar is app ka saara server-side
 * data AXIOS se aata hai (service/api.tsx). Axios par Next ka koi cache nahi
 * lagta, is liye ek hi request ke andar wahi call bar bar chali jati thi:
 *
 *     products/[id]     generateMetadata ka getProductById + page ka getProductById
 *     category/[slug]   buildCategoryMetadata ke 2 calls + CategoryView ke wahi 2
 *     products          buildProductsMetadata ka getAllProducts + view ka wahi
 *     blog/[slug]       getBySlug do baar
 *     har route         layout ka categoryService.getAll() + page ka apna getAll
 *
 * Har ISR regeneration par ye dugna kaam hota tha. Vercel ki "Fluid Active
 * CPU" isi se limit cross kar gayi thi.
 *
 * React ka `cache()` ek hi request ke andar result yaad rakh leta hai, aur
 * `generateMetadata` aur page render EK HI request mein hote hain, to dono ek
 * hi call share kar lete hain.
 *
 * ⚠️ Ye sirf SERVER components ke liye hai. Client components mein `cache()`
 * ka koi matlab nahi - wahan react-query (hooks/) pehle se ye kaam karta hai.
 *
 * ⚠️ Arguments se key banti hai, to call sites par arguments bilkul same
 * rakhna. `getProductsByFilterCached(slug, {}, page, 12)` aur
 * `getProductsByFilterCached(slug, {}, page, PAGE_SIZE)` tabhi ek mani jati
 * hain jab PAGE_SIZE waqai 12 ho. Object literal `{}` har baar naya hota hai
 * magar cache() shallow compare karta hai, is liye yahan wrapper khud `{}`
 * banata hai - call site se object pass mat karna.
 */

/** products/[id]: generateMetadata aur page dono isay use karte hain. */
export const getProductCached = cache((idOrSlug: string) =>
  productService.getProductById(idOrSlug)
);

/** category/[slug]: buildCategoryMetadata aur CategoryView dono. */
export const getCategoryBySlugCached = cache((slug: string) =>
  categoryService.getBySlug(slug)
);

/**
 * Category ke products. Filters object wrapper ke andar banta hai taake
 * cache() ka argument compare hamesha match kare.
 */
export const getCategoryProductsCached = cache(
  (slug: string, page: number, limit: number) =>
    productService.getProductsByFilter(slug, {}, page, limit)
);

/** /products aur /products/page/[page]. */
export const getAllProductsCached = cache((page: number, limit: number) =>
  productService.getAllProducts(page, limit)
);

/** blog/[slug]: generateMetadata aur page dono. */
export const getBlogPostCached = cache((slug: string) =>
  blogService.getBySlug(slug)
);

/** layout + homepage + /products, teeno ek hi request mein maangte hain. */
export const getCategoriesCached = cache(() => categoryService.getAll());
