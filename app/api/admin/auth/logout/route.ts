import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully.',
      },
      { status: 200 }
    );

    // Invalidate/remove the session cookie
    response.cookies.set(ADMIN_COOKIE_NAME, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('API /api/admin/auth/logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete logout.' },
      { status: 500 }
    );
  }
}
