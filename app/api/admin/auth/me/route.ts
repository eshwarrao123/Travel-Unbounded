import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Valid admin session required.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: session.userId,
          email: session.email,
          role: session.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API /api/admin/auth/me error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify admin session.' },
      { status: 500 }
    );
  }
}
