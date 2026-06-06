import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwt(token: string) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payloadBase64.length % 4 !== 0) {
      payloadBase64 += "=";
    }

    return JSON.parse(atob(payloadBase64));
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect admin dashboard — must have valid admin token
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = decodeJwt(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // /login is always accessible (guest checkout users can sign in anytime)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
