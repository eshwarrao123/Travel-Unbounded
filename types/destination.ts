import { Destination } from '@/lib/types';

/** Category of a destination — mirrors the site's Domestic / Global split. */
export type DestinationCategory = 'india' | 'international';

export const ALLOWED_DESTINATION_CATEGORIES: readonly DestinationCategory[] = [
  'india',
  'international',
] as const;

/** Regions supported by the existing public UI. */
export const ALLOWED_DESTINATION_REGIONS = [
  'Asia',
  'Europe',
  'Africa',
  'Americas',
  'Oceania',
  'Middle East',
] as const;

export type DestinationRegion = (typeof ALLOWED_DESTINATION_REGIONS)[number];

/** Travel styles already used by the Phase 1 destination data / UI. */
export const ALLOWED_TRAVEL_STYLES = [
  'adventure',
  'cultural',
  'nature',
  'luxury',
  'wellness',
  'culinary',
  'photography',
  'wildlife',
] as const;

/**
 * Destination as returned by the destinations API.
 * Extends the public `Destination` shape (used by all UI components) with
 * `id` (mapped from MongoDB `_id`) and an `imageUrl` alias for `heroImage`.
 */
export interface DestinationApiItem extends Destination {
  /** Alias of `heroImage`, kept for API-contract friendliness. */
  imageUrl: string;
  /** Free-form content tags managed via the CMS. */
  tags: string[];
}

export interface DestinationsListResponse {
  success: true;
  data: {
    destinations: DestinationApiItem[];
    total: number;
  };
}

export interface DestinationMutationResponse {
  success: true;
  data: DestinationApiItem;
  message: string;
}

export interface DestinationDeleteResponse {
  success: true;
  message: string;
}

export interface DestinationErrorResponse {
  success: false;
  error: {
    code:
      | 'INVALID_REQUEST'
      | 'UNAUTHORIZED'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'SERVER_ERROR';
    message: string;
    details?: Record<string, string>;
  };
}
