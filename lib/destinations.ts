import { destinations } from '@/data/destinations';
import { Destination, Region, TravelStyle } from './types';

/**
 * Get all destinations
 */
export function getAllDestinations(): Destination[] {
  return destinations;
}

/**
 * Get featured destinations
 */
export function getFeaturedDestinations(): Destination[] {
  return destinations.filter(dest => dest.featured);
}

/**
 * Get destination by slug
 */
export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find(dest => dest.slug === slug);
}

/**
 * Get destinations by region
 */
export function getDestinationsByRegion(region: Region): Destination[] {
  return destinations.filter(dest => dest.region === region);
}

/**
 * Get destinations by travel style
 */
export function getDestinationsByTravelStyle(style: TravelStyle): Destination[] {
  return destinations.filter(dest => dest.travelStyle.includes(style));
}

/**
 * Get all unique regions
 */
export function getAllRegions(): Region[] {
  const regions = new Set(destinations.map(dest => dest.region as Region));
  return Array.from(regions);
}

/**
 * Get all unique travel styles
 */
export function getAllTravelStyles(): TravelStyle[] {
  const styles = new Set<TravelStyle>();
  destinations.forEach(dest => {
    dest.travelStyle.forEach(style => styles.add(style));
  });
  return Array.from(styles);
}

/**
 * Search destinations by name or description
 */
export function searchDestinations(query: string): Destination[] {
  const lowercaseQuery = query.toLowerCase();
  return destinations.filter(
    dest =>
      dest.name.toLowerCase().includes(lowercaseQuery) ||
      dest.country.toLowerCase().includes(lowercaseQuery) ||
      dest.description.toLowerCase().includes(lowercaseQuery) ||
      dest.shortDescription.toLowerCase().includes(lowercaseQuery)
  );
}
