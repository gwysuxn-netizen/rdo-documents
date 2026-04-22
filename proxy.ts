import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to protect admin routes
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public access to /admin/login page itself
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.next();
  }

  // For admin routes that need protection, they will be handled by client-side useAdminAuth hook
  // This is a simple approach; for production, consider using server-side auth
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
