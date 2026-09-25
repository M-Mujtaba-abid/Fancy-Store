/**
 * On-demand ISR invalidation ka shared helper.
 *
 * Kyun zaroori hai: /category/[slug] page `generateStaticParams` use karta hai,
 * yani build time pe static HTML ban jati hai. Us page ka page-1 data server se
 * props mein aata hai (CategoryClient page===1 pe client fetch ignore karta hai,
 * taake redundant request na ho). Matlab agar page ka cache clear na ho, to
 * category page hamesha wahi products dikhayega jo build ke waqt the.
 *
 * Isi wajah se naya product add karne pe uski category page purani rehti thi.
 *
 * Ye helper non-fatal hai: fail ho jaye to page apni `revalidate` window pe
 * khud refresh ho jayegi (dekho app/(shop)/category/[slug]/page.tsx).
 */
export const revalidatePaths = async (paths: string[]) => {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return;

  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: unique }),
    });
  } catch {
    // ignore — timer-based revalidation safety net hai
  }
};

/** Homepage + (agar slug diya ho to) us category ka page. */
export const revalidateForCategory = (slug?: string | null) =>
  revalidatePaths(slug ? ["/", `/category/${slug}`] : ["/"]);

/**
 * Product save/edit ke baad: khud us product ka page bhi purge karo.
 *
 * ⚠️ Ye is liye zaroori hai ke product page ki `revalidate` window ab lambi
 * hai (app/(shop)/products/[id]/page.tsx). Pehle 5 minute thi, to bhool jane
 * par bhi page jaldi refresh ho jata tha. Ab bina is call ke edit kiya hua
 * price ya stock ghanton tak purana dikhta rahega.
 *
 * productSlug na ho (e.g. delete, jahan sirf id milti hai) to listing pages
 * phir bhi purge ho jati hain.
 */
export const revalidateForProduct = (
  productSlug?: string | null,
  categorySlug?: string | null
) => {
  const paths = ["/", "/products"];
  if (categorySlug) paths.push(`/category/${categorySlug}`);
  if (productSlug) paths.push(`/products/${productSlug}`);
  return revalidatePaths(paths);
};
