import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect root to marketplace
  if (pathname === '/') {
    const url = new URL('/marketplace', request.url);
    return NextResponse.redirect(url);
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 