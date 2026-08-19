import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand ISR invalidation.
 *
 * Homepage pe `export const revalidate = 3600` hai (app/page.tsx:2) aur Next
 * stale-while-revalidate karta hai — matlab window khatam hone ke baad bhi
 * PEHLA visitor purana HTML dekhta hai aur sirf background regeneration trigger
 * karta hai. Practically naya category tile 1-2 ghante tak nahi dikhta.
 *
 * revalidatePath us path ko revalidation ke liye mark kar deta hai, to AGLA
 * visitor fresh HTML dekhta hai.
 *
 * NOTE: revalidateTag jaan-boojh kar use nahi kiya — woh Next 16 mein badal
 * gaya hai (ab cacheTag/Cache Components ke saath pair hota hai). revalidatePath
 * previous caching model ke saath kaam karta hai, jo is app pe active hai.
 *
 * Security: REVALIDATE_SECRET set ho to header match zaroori hai. Set na ho to
 * route sirf ek known-paths allowlist revalidate karta hai — worst case koi
 * homepage ka cache clear kara sakta hai, data leak nahi.
 */

const ALLOWED_PATHS = new Set(["/", "/products", "/sitemap.xml"]);

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (secret) {
    const provided =
      request.headers.get("x-revalidate-secret") ||
      new URL(request.url).searchParams.get("secret");

    if (provided !== secret) {
      return NextResponse.json(
        { revalidated: false, message: "Invalid revalidate secret" },
        { status: 401 }
      );
    }
  }

  let paths: string[] = ["/"];
  try {
    const body = await request.json();
    if (Array.isArray(body?.paths) && body.paths.length) {
      paths = body.paths.map(String);
    }
  } catch {
    // body optional — default "/" hi revalidate hoga
  }

  const revalidated: string[] = [];
  const skipped: string[] = [];

  for (const path of paths) {
    // Category slugs dynamic hain, to /category/* bhi allow karna hai
    const isAllowed = ALLOWED_PATHS.has(path) || path.startsWith("/category/");
    if (!isAllowed) {
      skipped.push(path);
      continue;
    }
    revalidatePath(path);
    revalidated.push(path);
  }

  return NextResponse.json({ revalidated: true, paths: revalidated, skipped });
}
