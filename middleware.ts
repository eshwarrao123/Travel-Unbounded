import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE_NAME = 'admin_session';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return new TextEncoder().encode(secret);
}

async function isSessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload.role === 'admin' && typeof payload.email === 'string';
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await isSessionValid(token);

  // If user visits /admin/login
  if (pathname === '/admin/login') {
    if (valid) {
      // Already authenticated, redirect to admin dashboard
      const dashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow unauthenticated access to login page
    return NextResponse.next();
  }

  // For all other /admin routes (e.g. /admin, /admin/dashboard, etc.)
  if (!valid) {
    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('from', pathname);
    }

    const response = NextResponse.redirect(loginUrl);
    // If an invalid or expired token was sent, clear the bad cookie
    if (token) {
      response.cookies.set(ADMIN_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
      });
    }
    return response;
  }

  // If accessing /admin directly, redirect to /admin/dashboard
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
