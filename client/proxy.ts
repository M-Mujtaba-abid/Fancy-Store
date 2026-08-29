import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Next.js 16: a redirect thrown from inside an async Server Component (e.g.
// `permanentRedirect()` in products/[id]/page.tsx) only gets a real 30x
// status if it fires BEFORE the response starts streaming. This app has a
// root `app/loading.tsx`, so every page starts streaming (200 committed) the
// moment the page component awaits data — by the time the page's own
// redirect check runs, it's too late to change the status code (Next docs:
// file-conventions/loading#status-codes). So the numeric-id -> slug redirect
// has to happen here, before rendering starts, to give search engines a
// real permanent redirect.
export async function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/products\/(\d+)$/);
  if (!match) return NextResponse.next();

  const id = match[1];

  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${id}`);
    if (!res.ok) return NextResponse.next(); // let the page's own notFound() handle it

    const json = await res.json();
    const slug = json?.data?.slug;
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/products/${slug}`;
      return NextResponse.redirect(url, 308);
    }
  } catch {
    // Backend slow/unreachable — don't block the request, let the page
    // component fetch it normally instead.
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/products/:id",
};
