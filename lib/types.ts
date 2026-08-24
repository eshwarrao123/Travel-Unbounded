// Destination Data Model
export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  bestTimeToVisit: string[];
  duration: string;
  startingPrice?: number;
  highlights: string[];
  experiences: Experience[];
  travelStyle: TravelStyle[];
  featured: boolean;
  metadata?: {
    climate?: string;
    language?: string;
    currency?: string;
    timezone?: string;
  };
}

export interface Experience {
  title: string;
  description: string;
  icon?: string;
}

export type TravelStyle = 
  | 'adventure'
  | 'cultural'
  | 'nature'
  | 'luxury'
  | 'wellness'
  | 'culinary'
  | 'photography'
  | 'wildlife';

export type Region = 
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'Americas'
  | 'Oceania'
  | 'Middle East';
