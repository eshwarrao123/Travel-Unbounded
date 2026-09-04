import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'admin_session';
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: 'admin';
}

/**
 * Encodes the JWT secret for jose signing/verification.
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Generates an encrypted/signed JWT for an admin user session.
 */
export async function signAdminToken(payload: AdminSessionPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

/**
 * Verifies a raw JWT string using jose and extracts the session payload.
 * Compatible with both Node.js runtime and Edge runtime.
 */
export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin' || !payload.email || typeof payload.email !== 'string') {
      return null;
    }

    const userId = (payload.userId as string) || (payload.sub as string) || '';

    return {
      userId,
      email: payload.email,
      role: 'admin',
    };
  } catch {
    return null;
  }
}

/**
 * Returns standard production-ready httpOnly cookie attributes for the admin session.
 */
export function getAdminCookieOptions(maxAgeSeconds = SESSION_DURATION_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Extracts and verifies the current admin session from incoming Request headers or Next.js cookie store.
 */
export async function getAdminSession(request?: Request): Promise<AdminSessionPayload | null> {
  let token: string | undefined;

  // 1. Check direct Request cookie header if provided
  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Fall back to Next.js App Router cookies() store
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    } catch {
      // In contexts without cookies() (e.g., custom scripts or outside request context)
    }
  }

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}

/**
 * Reusable server-side helper for protected route handlers and server actions.
 * Throws an error if the request is unauthenticated.
 */
export async function requireAdmin(request?: Request): Promise<AdminSessionPayload> {
  const session = await getAdminSession(request);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
