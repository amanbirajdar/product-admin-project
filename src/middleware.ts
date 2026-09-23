import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/products') || pathname === '/') {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && token) {
    const productsUrl = new URL('/products', request.url);
    return NextResponse.redirect(productsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/products/:path*', '/login'],
};