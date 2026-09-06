import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import { getAdminSession } from '@/lib/auth';
import {
  isValidObjectId,
  validateStatusUpdate,
} from '@/lib/validations/enquiry';
import {
  AdminEnquiryItem,
  AdminEnquiryUpdateResponse,
  EnquiryErrorResponse,
  EnquiryStatus,
} from '@/types/enquiry';

/**
 * PATCH /api/enquiry/[id] (Admin Only)
 * Updates the lifecycle status of a specific customer enquiry.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AdminEnquiryUpdateResponse | EnquiryErrorResponse>> {
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

    // 2. Validate route param 'id'
    const { id } = await params;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid enquiry ID format. Must be a valid 24-character hexadecimal ObjectId.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Safely parse JSON request body
    let body: unknown;
    try {
      body = await request.json();
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

    // 4. Validate status update payload
    const validation = validateStatusUpdate(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // 5. Connect to MongoDB
    await connectToDatabase();

    // 6. Update strictly status and updatedAt (never arbitrary fields)
    const now = new Date();
    const updatedDoc = await Enquiry.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          updatedAt: now,
        },
      },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updatedDoc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Enquiry with ID "${id}" was not found.`,
          },
        },
        { status: 404 }
      );
    }

    // 7. Sanitize output to preserve privacy and prevent leakage
    const createdAtStr = updatedDoc.createdAt
      ? new Date(updatedDoc.createdAt).toISOString()
      : new Date().toISOString();
    const travelDateStr = updatedDoc.dateOfTravel
      ? new Date(updatedDoc.dateOfTravel).toISOString()
      : '';
    const updatedAtStr = updatedDoc.updatedAt
      ? new Date(updatedDoc.updatedAt).toISOString()
      : now.toISOString();

    const sanitizedData: AdminEnquiryItem = {
      id: updatedDoc._id.toString(),
      name: updatedDoc.fullName || '',
      fullName: updatedDoc.fullName || '',
      email: updatedDoc.email || '',
      phone: `${updatedDoc.countryCode || ''} ${updatedDoc.contactNumber || ''}`.trim(),
      countryCode: updatedDoc.countryCode || '',
      contactNumber: updatedDoc.contactNumber || '',
      travelDate: travelDateStr,
      dateOfTravel: travelDateStr,
      people: updatedDoc.numberOfPeople || 1,
      numberOfPeople: updatedDoc.numberOfPeople || 1,
      hotelCategory: updatedDoc.hotelCategory || 'Standard',
      numberOfChildren: updatedDoc.numberOfChildren ?? 0,
      status: updatedDoc.status as EnquiryStatus,
      createdAt: createdAtStr,
      updatedAt: updatedAtStr,
    };

    return NextResponse.json(
      {
        success: true,
        data: sanitizedData,
        message: 'Enquiry status updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API PATCH /api/enquiry/[id] error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while updating enquiry status.',
        },
      },
      { status: 500 }
    );
  }
}
