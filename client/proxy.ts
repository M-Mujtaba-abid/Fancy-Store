// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🔑 JWT Decode Function (Server-side safe for Edge/Proxy)
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
  } catch (err) {
    console.error("❌ JWT DECODE ERROR:", err); // Server-side console log
    return null;
  }
}

// 🛡️ Next.js v16+ Proxy Convention
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 📝 PRODUCTION DEBUG LOGS (Vercel ke logs tab mein nazar ayenge)
  console.log("--- PROXY TRIGGERED ---");
  console.log("Current Path:", pathname);
  console.log("Is Token Found In Cookies?:", !!token);
  if (token) {
    const decoded = decodeJwt(token);
    console.log("Decoded Role:", decoded?.role || "No Role Found");
  }
  console.log("----------------------------");

  // 1. Dashboard Protection
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("⛔ Redirecting to /login: No token found in cookies");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = decodeJwt(token);
    if (!decoded || decoded.role !== "admin") {
      console.log(`⛔ Redirecting to /login: Role is ${decoded?.role || 'invalid'}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Already Logged-In Admin Restriction
  if (pathname.startsWith("/login") && token) {
    const decoded = decodeJwt(token);
    if (decoded && decoded.role === "admin") {
      console.log("🔄 Redirecting to /dashboard: Admin already logged in");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Global Matcher configuration
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};