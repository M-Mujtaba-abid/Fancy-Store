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
