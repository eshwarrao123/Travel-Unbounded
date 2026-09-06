import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import Destination from '@/models/Destination';
import { getAdminSession } from '@/lib/auth';
import { ALLOWED_ENQUIRY_STATUSES } from '@/types/enquiry';
import {
  AnalyticsErrorResponse,
  AnalyticsSummary,
  AnalyticsSummaryResponse,
  HotelCategoryItem,
  MonthlyVolumePoint,
  StatusBreakdownItem,
  TopDestinationItem,
} from '@/types/analytics';

export const dynamic = 'force-dynamic';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * GET /api/analytics/summary (Admin Only)
 * Aggregates live database metrics from Enquiry and Destination collections.
 */
export async function GET(
  request: Request
): Promise<NextResponse<AnalyticsSummaryResponse | AnalyticsErrorResponse>> {
  try {
    // 1. Enforce server-side admin authentication
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

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Overview Metrics
    const [totalLeads, convertedLeads, activeDestinations] = await Promise.all([
      Enquiry.countDocuments({}),
      Enquiry.countDocuments({ status: 'Converted' }),
      Destination.countDocuments({}),
    ]);

    const conversionRate =
      totalLeads > 0
        ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
        : 0;

    // 4. Monthly Volume Aggregation (Rolling 6 Months)
    const now = new Date();
    // 1st of the month, 5 months prior to current month
    const startUtcYear = now.getUTCFullYear();
    const startUtcMonth = now.getUTCMonth() - 5;
    const startDate = new Date(Date.UTC(startUtcYear, startUtcMonth, 1));

    const rawMonthly = await Enquiry.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyMap = new Map<string, number>(
      rawMonthly.map((m) => [m._id, m.count])
    );

    const monthlyVolume: MonthlyVolumePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );
      const year = monthDate.getUTCFullYear();
      const monthIdx = monthDate.getUTCMonth();
      const period = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const label = MONTH_LABELS[monthIdx];
      const count = monthlyMap.get(period) || 0;

      monthlyVolume.push({
        period,
        label,
        count,
      });
    }

    // 5. Status Breakdown Aggregation
    // Backwards-compatible grouping: legacy documents without a status field resolve to 'New'
    const rawStatus = await Enquiry.aggregate<{ _id: string; count: number }>([
      {
        $project: {
          status: { $ifNull: ['$status', 'New'] },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = new Map<string, number>(
      rawStatus.map((s) => [s._id, s.count])
    );

    const statusBreakdown: StatusBreakdownItem[] = ALLOWED_ENQUIRY_STATUSES.map(
      (status) => {
        const count = statusMap.get(status) || 0;
        const percentage =
          totalLeads > 0
            ? Number(((count / totalLeads) * 100).toFixed(1))
            : 0;

        return {
          status,
          count,
          percentage,
        };
      }
    );

    // 6. Hotel Category Breakdown (Real persisted customer accommodation preference)
    const rawHotel = await Enquiry.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: '$hotelCategory',
          count: { $sum: 1 },
        },
      },
    ]);

    const hotelMap = new Map<string, number>(
      rawHotel.map((h) => [h._id, h.count])
    );

    const validHotelCategories = ['Luxury', 'Deluxe', 'Standard'];
    const hotelCategoryBreakdown: HotelCategoryItem[] = validHotelCategories.map(
      (category) => {
        const count = hotelMap.get(category) || 0;
        const percentage =
          totalLeads > 0
            ? Number(((count / totalLeads) * 100).toFixed(1))
            : 0;
        return {
          category,
          count,
          percentage,
        };
      }
    );

    // 7. Top Destinations Aggregation (Real persisted customer destination requests)
    // Legacy enquiries without a destination are excluded from rankings while continuing to be counted in totalLeads
    const rawDestinations = await Enquiry.aggregate<{
      slug: string;
      destination: string;
      count: number;
    }>([
      {
        $match: {
          destinationSlug: { $exists: true, $ne: null, $nin: [''] },
        },
      },
      {
        $group: {
          _id: '$destinationSlug',
          storedName: { $first: '$destinationName' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: 'slug',
          as: 'destDoc',
        },
      },
      {
        $unwind: {
          path: '$destDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          slug: '$_id',
          destination: {
            $ifNull: ['$destDoc.name', { $ifNull: ['$storedName', '$_id'] }],
          },
          count: '$count',
        },
      },
      {
        $sort: { count: -1, destination: 1 },
      },
      {
        $limit: 5,
      },
    ]);

    const topDestinations: TopDestinationItem[] = rawDestinations.map((d) => ({
      destination: d.destination,
      slug: d.slug,
      count: d.count,
    }));

    const destinationTrackingAvailable = topDestinations.length > 0;
    const topDestinationName =
      topDestinations.length > 0 ? topDestinations[0].destination : null;

    const data: AnalyticsSummary = {
      overview: {
        totalLeads,
        conversionRate,
        activeDestinations,
        convertedLeads,
        topDestination: topDestinationName,
      },
      monthlyVolume,
      statusBreakdown,
      topDestinations,
      hotelCategoryBreakdown,
      destinationTrackingAvailable,
    };

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'API GET /api/analytics/summary error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while calculating analytics summary.',
        },
      },
      { status: 500 }
    );
  }
}
