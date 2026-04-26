import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const payloadBase64Url = token.split('.')[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedJson = JSON.parse(atob(payloadBase64)); 
    return decodedJson;
  } catch (error) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // ✅ NAYA RULE: Agar user ALREADY logged in hai aur Login page par aaye
  if (token && pathname === '/login') {
    const decodedToken = decodeJwt(token);
    const userRole = decodedToken?.role;
    
    // Admin hai toh wapis dashboard bhej do, warna home par
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Purana Rule 1: Bina token dashboard pe aaye toh redirect to login/home
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url)); // Ya '/login' par bhej dein
  }

  // Purana Rule 2: Token hai par admin nahi hai aur dashboard par aaye
  if (token) {
    const decodedToken = decodeJwt(token);
    const userRole = decodedToken?.role; 

    if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};