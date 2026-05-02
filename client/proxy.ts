import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("Invalid JWT format - should have 3 parts");
      return null;
    }
    
    const payloadBase64Url = parts[1];
    let payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // ✅ VERCEL FIX: String ki length 4 ke multiple mein honi chahiye
    while (payloadBase64.length % 4 !== 0) {
      payloadBase64 += '=';
    }
    
    const decodedJson = JSON.parse(atob(payloadBase64));
    return decodedJson;
  } catch (error) {
    console.error("Middleware JWT Decode Error:", error);
    console.error("Token value:", token?.substring(0, 20) + '...');
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // ✅ DEBUG LOGGING (for Vercel troubleshooting)
  if (pathname.startsWith('/dashboard')) {
    console.log('=== DASHBOARD ACCESS ===');
    console.log('Token exists:', !!token);
    console.log('Pathname:', pathname);
    
    if (token) {
      const decoded = decodeJwt(token);
      console.log('Decoded token:', decoded ? `role=${decoded.role}` : 'DECODE FAILED');
    }
  }

  // ========== RULE 1: Already logged in user redirecting from login page ==========
  if (token && pathname === '/login') {
    const decodedToken = decodeJwt(token);
    const userRole = decodedToken?.role;
    
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (userRole === 'user') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ========== RULE 2: Dashboard access without token ==========
  if (!token && pathname.startsWith('/dashboard')) {
    console.warn('Dashboard access denied - no token');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ========== RULE 3: Dashboard access with non-admin token ==========
  if (token && pathname.startsWith('/dashboard')) {
    const decodedToken = decodeJwt(token);
    const userRole = decodedToken?.role;
    
    // Token might be invalid or decode failed
    if (!decodedToken || !userRole) {
      console.warn('Dashboard access denied - invalid/unreadable token');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // User is not admin
    if (userRole !== 'admin') {
      console.warn(`Dashboard access denied - user role is ${userRole}, not admin`);
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // ✅ ADMIN IS ALLOWED - Let them through
    console.log('Dashboard access ALLOWED for admin');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};