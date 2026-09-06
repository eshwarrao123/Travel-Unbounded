import { EnquiryStatus } from './enquiry';

export interface AnalyticsOverview {
  totalLeads: number;
  conversionRate: number;
  activeDestinations: number;
  convertedLeads: number;
  topDestination: string | null;
}

export interface MonthlyVolumePoint {
  period: string; // e.g. "2026-04"
  label: string;  // e.g. "Apr"
  count: number;
}

export interface StatusBreakdownItem {
  status: EnquiryStatus;
  count: number;
  percentage: number;
}

export interface TopDestinationItem {
  destination: string;
  slug?: string;
  count: number;
}

export interface HotelCategoryItem {
  category: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  overview: AnalyticsOverview;
  monthlyVolume: MonthlyVolumePoint[];
  statusBreakdown: StatusBreakdownItem[];
  topDestinations: TopDestinationItem[];
  hotelCategoryBreakdown: HotelCategoryItem[];
  destinationTrackingAvailable: boolean;
}

export interface AnalyticsSummaryResponse {
  success: true;
  data: AnalyticsSummary;
}

export interface AnalyticsErrorResponse {
  success: false;
  error: {
    code: 'UNAUTHORIZED' | 'SERVER_ERROR' | 'INVALID_REQUEST';
    message: string;
  };
}
