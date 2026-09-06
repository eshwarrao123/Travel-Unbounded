import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Destination, { serializeDestination } from '@/models/Destination';
import { getAdminSession } from '@/lib/auth';
import { validateDestinationCreate } from '@/lib/validations/destination';
import {
  ALLOWED_DESTINATION_CATEGORIES,
  DestinationCategory,
  DestinationErrorResponse,
  DestinationMutationResponse,
  DestinationsListResponse,
} from '@/types/destination';

export const dynamic = 'force-dynamic';

/**
 * GET /api/destinations (Public)
 * Returns the database-backed destination catalog.
 * Optional `?category=india|international` filter (matches the site's category split).
 */
export async function GET(
  request: Request
): Promise<NextResponse<DestinationsListResponse | DestinationErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const rawCategory = searchParams.get('category');

    let categoryFilter: DestinationCategory | undefined;
    if (rawCategory && rawCategory.trim() !== '') {
      const category = rawCategory.trim().toLowerCase();
      if (!(ALLOWED_DESTINATION_CATEGORIES as readonly string[]).includes(category)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: `Invalid category "${rawCategory}". Allowed values: ${ALLOWED_DESTINATION_CATEGORIES.join(', ')}.`,
            },
          },
          { status: 400 }
        );
      }
      categoryFilter = category as DestinationCategory;
    }

    await connectToDatabase();

    const docs = await Destination.find(
      categoryFilter ? { category: categoryFilter } : {}
    )
      .sort({ category: 1, createdAt: 1, _id: 1 })
      .lean();

    const destinations = docs.map((doc) => serializeDestination(doc));

    return NextResponse.json(
      {
        success: true,
        data: {
          destinations,
          total: destinations.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API GET /api/destinations error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while retrieving destinations.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/destinations (Admin Only)
 * Creates a destination from the admin CMS.
 */
export async function POST(
  request: Request
): Promise<NextResponse<DestinationMutationResponse | DestinationErrorResponse>> {
  try {
    // 1. Enforce admin authentication server-side (not only middleware)
    const session = await getAdminSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized. Valid admin session required.',
          },
        },
        { status: 401 }
      );
    }

    // 2. Safely parse JSON body
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid or malformed JSON payload.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate payload server-side
    const validation = validateDestinationCreate(payload);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: validation.error,
            ...(validation.errors ? { details: validation.errors } : {}),
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. Connect and enforce slug uniqueness
    await connectToDatabase();

    const existing = await Destination.findOne({ slug: data.slug }).lean();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: `A destination with slug "${data.slug}" already exists.`,
          },
        },
        { status: 409 }
      );
    }

    // 5. Create — only validated, normalized fields are passed to MongoDB
    try {
      const created = await Destination.create(data);
      return NextResponse.json(
        {
          success: true,
          data: serializeDestination(created),
          message: 'Destination created successfully.',
        },
        { status: 201 }
      );
    } catch (err) {
      // Handle race-condition duplicate key violations safely
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONFLICT',
              message: `A destination with slug "${data.slug}" already exists.`,
            },
          },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('API POST /api/destinations error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while creating the destination.',
        },
      },
      { status: 500 }
    );
  }
}
