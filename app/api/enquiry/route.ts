import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import Destination from '@/models/Destination';
import {
  validateEnquiry,
  validateEnquiryQueryParams,
  escapeRegex,
} from '@/lib/validations/enquiry';
import { getAdminSession } from '@/lib/auth';
import {
  AdminEnquiryItem,
  AdminEnquiryListResponse,
  EnquiryErrorResponse,
  EnquiryStatus,
} from '@/types/enquiry';

/**
 * GET /api/enquiry (Admin Only)
 * Retrieves paginated list of enquiries with optional status filter and name/email search.
 */
export async function GET(
  request: Request
): Promise<NextResponse<AdminEnquiryListResponse | EnquiryErrorResponse>> {
  try {
    // 1. Enforce admin authentication server-side
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

    // 2. Parse and validate query parameters
    const url = new URL(request.url);
    const queryValidation = validateEnquiryQueryParams(url.searchParams);
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: queryValidation.error,
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, status, search } = queryValidation.data;

    // 3. Connect to MongoDB
    await connectToDatabase();

    // 4. Build MongoDB filter query
    const conditions: Record<string, unknown>[] = [];

    // Status filter
    if (status) {
      if (status === 'New') {
        // Backwards-compatible query for legacy records created prior to status field
        conditions.push({
          $or: [
            { status: 'New' },
            { status: { $exists: false } },
            { status: null },
          ],
        });
      } else {
        conditions.push({ status });
      }
    }

    // Search filter (case-insensitive customer name or email)
    if (search) {
      const escaped = escapeRegex(search);
      const searchRegex = new RegExp(escaped, 'i');
      conditions.push({
        $or: [
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
      });
    }

    const mongoFilter =
      conditions.length > 1
        ? { $and: conditions }
        : conditions.length === 1
        ? conditions[0]
        : {};

    // 5. Query matching count and paginated items in parallel or sequence
    const total = await Enquiry.countDocuments(mongoFilter);
    const totalPages = Math.ceil(total / limit) || 1;

    const rawDocs = await Enquiry.find(mongoFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // 6. Map and sanitize enquiry documents to protect internals
    const enquiries: AdminEnquiryItem[] = rawDocs.map((doc) => {
      const createdAtStr = doc.createdAt
        ? new Date(doc.createdAt).toISOString()
        : new Date().toISOString();
      const travelDateStr = doc.dateOfTravel
        ? new Date(doc.dateOfTravel).toISOString()
        : '';
      const updatedAtStr = doc.updatedAt
        ? new Date(doc.updatedAt).toISOString()
        : undefined;

      const fallbackStatus = (doc.status as EnquiryStatus) || 'New';

      return {
        id: doc._id.toString(),
        name: doc.fullName || '',
        fullName: doc.fullName || '',
        email: doc.email || '',
        phone: `${doc.countryCode || ''} ${doc.contactNumber || ''}`.trim(),
        countryCode: doc.countryCode || '',
        contactNumber: doc.contactNumber || '',
        travelDate: travelDateStr,
        dateOfTravel: travelDateStr,
        people: doc.numberOfPeople || 1,
        numberOfPeople: doc.numberOfPeople || 1,
        hotelCategory: doc.hotelCategory || 'Standard',
        numberOfChildren: doc.numberOfChildren ?? 0,
        status: fallbackStatus,
        destinationSlug: doc.destinationSlug || null,
        destinationName: doc.destinationName || null,
        destination: doc.destinationName || doc.destinationSlug || null,
        createdAt: createdAtStr,
        ...(updatedAtStr ? { updatedAt: updatedAtStr } : {}),
      };
    });

    // 7. Return structured JSON response
    return NextResponse.json(
      {
        success: true,
        data: {
          enquiries,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API GET /api/enquiry error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while retrieving enquiries.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enquiry (Public)
 * Handles customer contact/enquiry submissions. Preserved from Phase 1.
 */
export async function POST(request: Request) {
  try {
    // 1. Parse JSON safely
    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or malformed JSON body.' },
        { status: 400 }
      );
    }

    // 2. Validate payload server-side
    const validation = validateEnquiry(payload);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // 3. Connect to MongoDB
    await connectToDatabase();

    // 4. If destinationSlug is provided, validate that destination exists in the catalog
    let destinationName: string | undefined = undefined;
    if (validation.data?.destinationSlug) {
      const existingDestination = await Destination.findOne({
        slug: validation.data.destinationSlug,
      }).lean();

      if (!existingDestination) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'The selected destination does not exist.',
            },
            message: 'The selected destination does not exist.',
          },
          { status: 400 }
        );
      }

      destinationName = existingDestination.name;
    }

    // 5. Create an Enquiry document with initial 'New' status and destination snapshot
    const enquiryData: Record<string, unknown> = {
      ...validation.data,
      status: 'New',
    };

    if (destinationName) {
      enquiryData.destinationName = destinationName;
    }

    const enquiry = new Enquiry(enquiryData);

    // 6. Save it
    await enquiry.save();

    // 7. Return JSON response
    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API POST /api/enquiry error:', error instanceof Error ? error.message : error);

    // Distinguish generic server errors vs connection errors
    return NextResponse.json(
      { success: false, message: 'Unable to submit enquiry right now. Please try again later.' },
      { status: 500 }
    );
  }
}
