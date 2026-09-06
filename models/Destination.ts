import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  ALLOWED_DESTINATION_CATEGORIES,
  ALLOWED_DESTINATION_REGIONS,
  ALLOWED_TRAVEL_STYLES,
  DestinationCategory,
} from '@/types/destination';
import { TravelStyle } from '@/lib/types';

export interface IExperience {
  title: string;
  description: string;
  icon?: string;
}

export interface IDestinationMetadata {
  climate?: string;
  language?: string;
  currency?: string;
  timezone?: string;
}

export interface IDestination extends Document {
  slug: string;
  name: string;
  country: string;
  category: DestinationCategory;
  region: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  bestTimeToVisit: string[];
  duration: string;
  startingPrice: number;
  highlights: string[];
  experiences: IExperience[];
  travelStyle: string[];
  tags: string[];
  featured: boolean;
  metadata?: IDestinationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    name: {
      type: String,
      required: [true, 'Destination name is required.'],
      trim: true,
      maxlength: 120,
    },
    country: {
      type: String,
      required: [true, 'Country is required.'],
      trim: true,
      maxlength: 80,
    },
    category: {
      type: String,
      required: true,
      enum: ALLOWED_DESTINATION_CATEGORIES,
      index: true,
    },
    region: {
      type: String,
      required: true,
      enum: ALLOWED_DESTINATION_REGIONS,
      default: 'Asia',
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required.'],
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: 5000,
    },
    heroImage: {
      type: String,
      required: [true, 'Hero image URL is required.'],
      trim: true,
      maxlength: 2048,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    bestTimeToVisit: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60,
    },
    startingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    highlights: {
      type: [String],
      default: [],
    },
    experiences: {
      _id: false,
      type: [
        {
          title: { type: String, required: true, trim: true, maxlength: 120 },
          description: { type: String, required: true, trim: true, maxlength: 500 },
          icon: { type: String, trim: true },
        },
      ],
      default: [],
    },
    travelStyle: {
      type: [String],
      enum: ALLOWED_TRAVEL_STYLES,
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    metadata: {
      _id: false,
      type: {
        climate: { type: String, trim: true, maxlength: 120 },
        language: { type: String, trim: true, maxlength: 120 },
        currency: { type: String, trim: true, maxlength: 120 },
        timezone: { type: String, trim: true, maxlength: 80 },
      },
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Read-optimization index for the public catalog (category sections, stable order)
DestinationSchema.index({ category: 1, createdAt: 1, _id: 1 });
DestinationSchema.index({ featured: 1 });

const Destination: Model<IDestination> =
  mongoose.models.Destination ||
  mongoose.model<IDestination>('Destination', DestinationSchema);

export interface DestinationDocumentData {
  _id: unknown;
  slug: string;
  name: string;
  country: string;
  category: DestinationCategory;
  region: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  galleryImages?: string[];
  bestTimeToVisit?: string[];
  duration?: string;
  startingPrice?: number;
  highlights?: string[];
  experiences?: IExperience[];
  travelStyle?: string[];
  tags?: string[];
  featured?: boolean;
  metadata?: IDestinationMetadata;
}

export interface SerializedDestination {
  id: string;
  slug: string;
  name: string;
  country: string;
  category: DestinationCategory;
  region: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  imageUrl: string;
  galleryImages: string[];
  bestTimeToVisit: string[];
  duration: string;
  startingPrice: number;
  highlights: string[];
  experiences: IExperience[];
  travelStyle: TravelStyle[];
  tags: string[];
  featured: boolean;
  metadata?: IDestinationMetadata;
}

/**
 * Serializes a (lean) Destination document into the public/API shape.
 * Removes MongoDB internals (__v) and maps `_id` to a string `id`.
 */
export function serializeDestination(doc: DestinationDocumentData): SerializedDestination {
  const heroImage = doc.heroImage || '';
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    country: doc.country,
    category: doc.category,
    region: doc.region,
    shortDescription: doc.shortDescription,
    description: doc.description,
    heroImage,
    imageUrl: heroImage,
    galleryImages: doc.galleryImages || [],
    bestTimeToVisit: doc.bestTimeToVisit || [],
    duration: doc.duration || '',
    startingPrice: doc.startingPrice ?? 0,
    highlights: doc.highlights || [],
    experiences: (doc.experiences || []).map((exp) => ({
      title: exp.title,
      description: exp.description,
      ...(exp.icon ? { icon: exp.icon } : {}),
    })),
    travelStyle: (doc.travelStyle || []) as TravelStyle[],
    tags: doc.tags || [],
    featured: doc.featured ?? false,
    ...(doc.metadata
        ? {
            metadata: {
              ...(doc.metadata.climate ? { climate: doc.metadata.climate } : {}),
              ...(doc.metadata.language ? { language: doc.metadata.language } : {}),
              ...(doc.metadata.currency ? { currency: doc.metadata.currency } : {}),
              ...(doc.metadata.timezone ? { timezone: doc.metadata.timezone } : {}),
            },
          }
        : {}),
  };
}

export default Destination;
