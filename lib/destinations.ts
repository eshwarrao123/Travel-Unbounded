import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import DestinationModel, {
  DestinationDocumentData,
  serializeDestination,
} from '@/models/Destination';
import { Destination } from './types';

/**
 * Database-backed destination catalog (Phase 2 — Destination CMS).
 *
 * The public site previously read the static dataset in data/destinations.ts.
 * Every accessor below now reads from MongoDB via the shared connection helper.
 * `cache()` dedupes the catalog query within a single server render pass, so a
 * page rendering multiple destination sections still issues one DB query.
 *
 * The original static file is kept untouched as the migration seed source.
 */

/** Get all destinations (single deduplicated query per render pass). */
export const getAllDestinations = cache(async (): Promise<Destination[]> => {
  await connectToDatabase();
  const docs = await DestinationModel.find()
    .sort({ category: 1, createdAt: 1, _id: 1 })
    .lean();
  return docs.map((doc) =>
    serializeDestination(
      doc as unknown as DestinationDocumentData
    ) as unknown as Destination
  );
});

/**
 * Get featured destinations
 */
export async function getFeaturedDestinations(): Promise<Destination[]> {
  const all = await getAllDestinations();
  return all.filter((dest) => dest.featured);
}

/**
 * Get India destinations
 */
export async function getIndiaDestinations(): Promise<Destination[]> {
  const all = await getAllDestinations();
  return all.filter((dest) => dest.category === 'india');
}

/**
 * Get International destinations
 */
export async function getInternationalDestinations(): Promise<Destination[]> {
  const all = await getAllDestinations();
  return all.filter((dest) => dest.category === 'international');
}

/**
 * Get destination by slug
 */
export async function getDestinationBySlug(
  slug: string
): Promise<Destination | undefined> {
  const all = await getAllDestinations();
  return all.find((dest) => dest.slug === slug);
}
