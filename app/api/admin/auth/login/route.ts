import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME, getAdminCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or malformed JSON payload.' },
        { status: 400 }
      );
    }

    const { email, password } = body || {};

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 2. Database verification
    await connectToDatabase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Password comparison with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Issue JWT
    const token = await signAdminToken({
      userId: user._id.toString(),
      email: user.email,
      role: 'admin',
    });

    // 5. Build response with secure httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Authentication successful.',
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    const cookieOptions = getAdminCookieOptions();
    response.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    console.error('API /api/admin/auth/login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected authentication error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
