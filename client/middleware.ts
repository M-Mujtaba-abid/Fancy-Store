// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🔑 JWT Decode Function (Server-side Edge safe)
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

// 🛡️ Next.js Standard Middleware Function Name
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. 🛡️ Protect Admin Dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = decodeJwt(token);
    // Agar token kharab hai ya user admin nahi hai -> kick to login
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. 🚫 Block Logged-In Admins from accessing /login again
  if (pathname.startsWith("/login") && token) {
    const decoded = decodeJwt(token);
    // Agar admin pehle se logged in hai, to usey login page se dashboard par bhej do
    if (decoded && decoded.role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Request ko agay jaane dein agar sab theek hai
  return NextResponse.next();
}

// Global Matcher configuration
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};