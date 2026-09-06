import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Destination, { serializeDestination } from '@/models/Destination';
import { getAdminSession } from '@/lib/auth';
import { isValidObjectId } from '@/lib/validations/enquiry';
import { validateDestinationUpdate } from '@/lib/validations/destination';
import {
  DestinationDeleteResponse,
  DestinationErrorResponse,
  DestinationMutationResponse,
} from '@/types/destination';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/destinations/[id] (Admin Only)
 * Updates whitelisted destination fields. Never accepts database internals.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DestinationMutationResponse | DestinationErrorResponse>> {
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
            message: 'Invalid destination ID format. Must be a valid 24-character hexadecimal ObjectId.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Safely parse JSON body
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

    // 4. Validate update payload (strict whitelist — _id/createdAt/etc. rejected)
    const validation = validateDestinationUpdate(payload);
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

    // 5. Connect
    await connectToDatabase();

    // 6. Slug uniqueness check (excluding this document)
    if (data.slug) {
      const conflict = await Destination.exists({
        slug: data.slug,
        _id: { $ne: new mongoose.Types.ObjectId(id) },
      });
      if (conflict) {
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
    }

    // 7. Update strictly whitelisted fields + updatedAt
    const now = new Date();
    const updatedDoc = await Destination.findByIdAndUpdate(
      id,
      {
        $set: {
          ...data,
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
            message: `Destination with ID "${id}" was not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: serializeDestination(updatedDoc),
        message: 'Destination updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API PATCH /api/destinations/[id] error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while updating the destination.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/destinations/[id] (Admin Only)
 * Deletes exactly one destination by its ObjectId. No filters, no mass deletion.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DestinationDeleteResponse | DestinationErrorResponse>> {
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
            message: 'Invalid destination ID format. Must be a valid 24-character hexadecimal ObjectId.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Connect and delete only the requested document
    await connectToDatabase();
    const deletedDoc = await Destination.findByIdAndDelete(id).lean();

    if (!deletedDoc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Destination with ID "${id}" was not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Destination deleted successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API DELETE /api/destinations/[id] error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while deleting the destination.',
        },
      },
      { status: 500 }
    );
  }
}
