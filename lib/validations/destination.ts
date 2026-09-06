import {
  ALLOWED_DESTINATION_CATEGORIES,
  ALLOWED_DESTINATION_REGIONS,
  ALLOWED_TRAVEL_STYLES,
  DestinationCategory,
} from '@/types/destination';

/** Normalized, validated payload for POST /api/destinations. */
export interface DestinationCreateData {
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
  experiences: { title: string; description: string; icon?: string }[];
  travelStyle: string[];
  tags: string[];
  featured: boolean;
  metadata?: {
    climate?: string;
    language?: string;
    currency?: string;
    timezone?: string;
  };
}

export type DestinationUpdateData = Partial<DestinationCreateData>;

export type DestinationValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string> };

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_REGEX = /^https?:\/\/\S+$/i;
const METADATA_KEYS = ['climate', 'language', 'currency', 'timezone'] as const;

/** Converts a destination name into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validateStringArray(
  value: unknown,
  fieldLabel: string,
  options: { maxItems?: number; maxItemLength?: number },
  errors: Record<string, string>
): string[] | undefined {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors[fieldLabel] = `${fieldLabel} must be an array of strings.`;
    return undefined;
  }
  const cleaned: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      errors[fieldLabel] = `${fieldLabel} must only contain strings.`;
      return undefined;
    }
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (options.maxItemLength && trimmed.length > options.maxItemLength) {
      errors[fieldLabel] = `${fieldLabel} items must be at most ${options.maxItemLength} characters.`;
      return undefined;
    }
    cleaned.push(trimmed);
  }
  if (options.maxItems && cleaned.length > options.maxItems) {
    errors[fieldLabel] = `${fieldLabel} must contain at most ${options.maxItems} items.`;
    return undefined;
  }
  return cleaned;
}

function validateImageUrl(value: unknown, fieldLabel: string, errors: Record<string, string>): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    errors[fieldLabel] = 'Image URL is required.';
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length > 2048 || !URL_REGEX.test(trimmed)) {
    errors[fieldLabel] = 'Image URL must be a valid http(s) URL.';
    return undefined;
  }
  return trimmed;
}

function validatePrice(value: unknown, errors: Record<string, string>): number | undefined {
  if (value === undefined || value === null || value === '') return 0;
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    errors.price = 'Price must be a valid number.';
    return undefined;
  }
  if (num < 0) {
    errors.price = 'Price must be a non-negative number.';
    return undefined;
  }
  return Math.round(num);
}

function validateExperiences(
  value: unknown,
  errors: Record<string, string>
): { title: string; description: string; icon?: string }[] | undefined {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.experiences = 'experiences must be an array.';
    return undefined;
  }
  const result: { title: string; description: string; icon?: string }[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.experiences = 'Each experience must be an object with title and description.';
      return undefined;
    }
    const record = item as Record<string, unknown>;
    const title = asTrimmedString(record.title);
    const description = asTrimmedString(record.description);
    if (!title || !description) {
      errors.experiences = 'Each experience requires a non-empty title and description.';
      return undefined;
    }
    const icon = asTrimmedString(record.icon);
    result.push(icon ? { title, description, icon } : { title, description });
  }
  return result;
}

function validateTravelStyle(value: unknown, errors: Record<string, string>): string[] | undefined {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.travelStyle = 'travelStyle must be an array.';
    return undefined;
  }
  const cleaned: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      errors.travelStyle = 'travelStyle must only contain strings.';
      return undefined;
    }
    const normalized = item.trim().toLowerCase();
    if (normalized && !(ALLOWED_TRAVEL_STYLES as readonly string[]).includes(normalized)) {
      errors.travelStyle = `Invalid travel style "${item}". Allowed values: ${ALLOWED_TRAVEL_STYLES.join(', ')}.`;
      return undefined;
    }
    if (normalized) cleaned.push(normalized);
  }
  return cleaned;
}

function validateMetadata(
  value: unknown,
  errors: Record<string, string>
): NonNullable<DestinationCreateData['metadata']> | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) {
    errors.metadata = 'metadata must be an object.';
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const result: NonNullable<DestinationCreateData['metadata']> = {};
  for (const key of METADATA_KEYS) {
    const raw = record[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== 'string') {
      errors.metadata = `metadata.${key} must be a string.`;
      return undefined;
    }
    const trimmed = raw.trim();
    if (trimmed) result[key] = trimmed;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Validates request payload for POST /api/destinations.
 * Accepts `price` / `startingPrice` and `heroImage` / `imageUrl` aliases.
 */
export function validateDestinationCreate(
  payload: unknown
): DestinationValidationResult<DestinationCreateData> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { success: false, error: 'Request body must be a valid JSON object.' };
  }
  const record = payload as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const data: Partial<DestinationCreateData> = {};

  // name (required)
  const name = asTrimmedString(record.name);
  if (!name) errors.name = 'Name is required.';
  else if (name.length > 120) errors.name = 'Name must be at most 120 characters.';
  else data.name = name;

  // category (required)
  const category = asTrimmedString(record.category).toLowerCase();
  if (!category) errors.category = 'Category is required.';
  else if (!(ALLOWED_DESTINATION_CATEGORIES as readonly string[]).includes(category)) {
    errors.category = `Invalid category "${String(record.category)}". Allowed values: ${ALLOWED_DESTINATION_CATEGORIES.join(', ')}.`;
  } else data.category = category as DestinationCategory;

  // heroImage / imageUrl alias (required)
  const heroImage = validateImageUrl(record.heroImage ?? record.imageUrl, 'imageUrl', errors);
  if (heroImage !== undefined) data.heroImage = heroImage;

  // description (required)
  const description = asTrimmedString(record.description);
  if (!description) errors.description = 'Description is required.';
  else if (description.length > 5000) errors.description = 'Description must be at most 5000 characters.';
  else data.description = description;

  // shortDescription — optional on input (derived from description when omitted; required by the public UI)
  let shortDescription = asTrimmedString(record.shortDescription);
  if (!shortDescription && description) {
    shortDescription =
      description.length > 140 ? `${description.slice(0, 140).trimEnd()}...` : description;
  }
  data.shortDescription = shortDescription.slice(0, 300);

  // price / startingPrice alias
  const price = validatePrice(record.price ?? record.startingPrice, errors);
  if (price !== undefined) data.startingPrice = price;

  // tags
  const tags = validateStringArray(record.tags, 'tags', { maxItems: 20, maxItemLength: 40 }, errors);
  if (tags !== undefined) data.tags = tags;

  // slug (optional — generated from name when omitted)
  const slugInput = asTrimmedString(record.slug).toLowerCase();
  if (slugInput) {
    if (!SLUG_REGEX.test(slugInput)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers and hyphens (e.g. "kerala-backwaters").';
    } else {
      data.slug = slugInput;
    }
  } else if (name && !errors.name) {
    const generated = slugify(name);
    if (!generated) errors.name = 'Name must contain at least one letter or number to generate a slug.';
    else data.slug = generated;
  }

  // country (defaults to name when omitted)
  const country = asTrimmedString(record.country);
  data.country = (country || name || 'India').slice(0, 80);

  // region
  const region = asTrimmedString(record.region);
  if (region) {
    if (!(ALLOWED_DESTINATION_REGIONS as readonly string[]).includes(region)) {
      errors.region = `Invalid region "${region}". Allowed values: ${ALLOWED_DESTINATION_REGIONS.join(', ')}.`;
    } else {
      data.region = region;
    }
  } else {
    data.region = 'Asia';
  }

  // duration
  data.duration = asTrimmedString(record.duration).slice(0, 60);

  // galleryImages (validated URLs)
  const galleryImages = validateStringArray(record.galleryImages, 'galleryImages', { maxItems: 20, maxItemLength: 2048 }, errors);
  if (galleryImages !== undefined) {
    if (galleryImages.some((url) => !URL_REGEX.test(url))) {
      errors.galleryImages = 'galleryImages must contain valid http(s) URLs.';
    } else {
      data.galleryImages = galleryImages;
    }
  }

  const bestTimeToVisit = validateStringArray(record.bestTimeToVisit, 'bestTimeToVisit', { maxItems: 12, maxItemLength: 40 }, errors);
  if (bestTimeToVisit !== undefined) data.bestTimeToVisit = bestTimeToVisit;

  const highlights = validateStringArray(record.highlights, 'highlights', { maxItems: 12, maxItemLength: 300 }, errors);
  if (highlights !== undefined) data.highlights = highlights;

  const experiences = validateExperiences(record.experiences, errors);
  if (experiences !== undefined) data.experiences = experiences;

  const travelStyle = validateTravelStyle(record.travelStyle, errors);
  if (travelStyle !== undefined) data.travelStyle = travelStyle;

  // featured
  if (record.featured === undefined || record.featured === null) data.featured = false;
  else if (typeof record.featured === 'boolean') data.featured = record.featured;
  else errors.featured = 'featured must be a boolean.';

  const metadata = validateMetadata(record.metadata, errors);
  if (metadata) data.metadata = metadata;

  if (Object.keys(errors).length > 0) {
    return { success: false, error: 'Validation failed.', errors };
  }
  return { success: true, data: data as DestinationCreateData };
}

const ALLOWED_UPDATE_FIELDS = [
  'slug',
  'name',
  'country',
  'category',
  'region',
  'shortDescription',
  'description',
  'heroImage',
  'imageUrl',
  'galleryImages',
  'bestTimeToVisit',
  'duration',
  'startingPrice',
  'price',
  'highlights',
  'experiences',
  'travelStyle',
  'tags',
  'featured',
  'metadata',
];

const FORBIDDEN_UPDATE_FIELDS = ['_id', 'id', 'createdAt', 'updatedAt'];

/**
 * Validates request payload for PATCH /api/destinations/[id].
 * Strict field whitelist — rejects database internals (_id, createdAt, ...)
 * and any unsupported fields. Requires at least one updatable field.
 */
export function validateDestinationUpdate(
  payload: unknown
): DestinationValidationResult<DestinationUpdateData> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { success: false, error: 'Request body must be a valid JSON object.' };
  }
  const record = payload as Record<string, unknown>;
  const provided = Object.keys(record);

  for (const key of provided) {
    if (FORBIDDEN_UPDATE_FIELDS.includes(key)) {
      return { success: false, error: `Field "${key}" cannot be modified.` };
    }
  }

  const unsupported = provided.filter((key) => !ALLOWED_UPDATE_FIELDS.includes(key));
  if (unsupported.length > 0) {
    return { success: false, error: `Unsupported field(s): ${unsupported.join(', ')}.` };
  }

  if (!ALLOWED_UPDATE_FIELDS.some((key) => key in record)) {
    return { success: false, error: 'Provide at least one field to update.' };
  }

  const errors: Record<string, string> = {};
  const data: DestinationUpdateData = {};

  if ('name' in record) {
    const name = asTrimmedString(record.name);
    if (!name) errors.name = 'Name cannot be empty.';
    else if (name.length > 120) errors.name = 'Name must be at most 120 characters.';
    else data.name = name;
  }

  if ('category' in record) {
    const category = asTrimmedString(record.category).toLowerCase();
    if (!(ALLOWED_DESTINATION_CATEGORIES as readonly string[]).includes(category)) {
      errors.category = `Invalid category "${String(record.category)}". Allowed values: ${ALLOWED_DESTINATION_CATEGORIES.join(', ')}.`;
    } else {
      data.category = category as DestinationCategory;
    }
  }

  if ('heroImage' in record || 'imageUrl' in record) {
    const heroImage = validateImageUrl(record.heroImage ?? record.imageUrl, 'imageUrl', errors);
    if (heroImage !== undefined) data.heroImage = heroImage;
  }

  if ('description' in record) {
    const description = asTrimmedString(record.description);
    if (!description) errors.description = 'Description cannot be empty.';
    else if (description.length > 5000) errors.description = 'Description must be at most 5000 characters.';
    else data.description = description;
  }

  if ('shortDescription' in record) {
    const shortDescription = asTrimmedString(record.shortDescription);
    if (!shortDescription) errors.shortDescription = 'Short description cannot be empty.';
    else if (shortDescription.length > 300) errors.shortDescription = 'Short description must be at most 300 characters.';
    else data.shortDescription = shortDescription;
  }

  if ('price' in record || 'startingPrice' in record) {
    const price = validatePrice(record.price ?? record.startingPrice, errors);
    if (price !== undefined) data.startingPrice = price;
  }

  if ('tags' in record) {
    const tags = validateStringArray(record.tags, 'tags', { maxItems: 20, maxItemLength: 40 }, errors);
    if (tags !== undefined) data.tags = tags;
  }

  if ('slug' in record) {
    const slugInput = asTrimmedString(record.slug).toLowerCase();
    if (!slugInput || !SLUG_REGEX.test(slugInput)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers and hyphens.';
    } else {
      data.slug = slugInput;
    }
  }

  if ('country' in record) {
    const country = asTrimmedString(record.country);
    if (!country) errors.country = 'Country cannot be empty.';
    else data.country = country.slice(0, 80);
  }

  if ('region' in record) {
    const region = asTrimmedString(record.region);
    if (!(ALLOWED_DESTINATION_REGIONS as readonly string[]).includes(region)) {
      errors.region = `Invalid region "${region}". Allowed values: ${ALLOWED_DESTINATION_REGIONS.join(', ')}.`;
    } else {
      data.region = region;
    }
  }

  if ('duration' in record) {
    data.duration = asTrimmedString(record.duration).slice(0, 60);
  }

  if ('galleryImages' in record) {
    const galleryImages = validateStringArray(record.galleryImages, 'galleryImages', { maxItems: 20, maxItemLength: 2048 }, errors);
    if (galleryImages !== undefined) {
      if (galleryImages.some((url) => !URL_REGEX.test(url))) {
        errors.galleryImages = 'galleryImages must contain valid http(s) URLs.';
      } else {
        data.galleryImages = galleryImages;
      }
    }
  }

  if ('bestTimeToVisit' in record) {
    const bestTimeToVisit = validateStringArray(record.bestTimeToVisit, 'bestTimeToVisit', { maxItems: 12, maxItemLength: 40 }, errors);
    if (bestTimeToVisit !== undefined) data.bestTimeToVisit = bestTimeToVisit;
  }

  if ('highlights' in record) {
    const highlights = validateStringArray(record.highlights, 'highlights', { maxItems: 12, maxItemLength: 300 }, errors);
    if (highlights !== undefined) data.highlights = highlights;
  }

  if ('experiences' in record) {
    const experiences = validateExperiences(record.experiences, errors);
    if (experiences !== undefined) data.experiences = experiences;
  }

  if ('travelStyle' in record) {
    const travelStyle = validateTravelStyle(record.travelStyle, errors);
    if (travelStyle !== undefined) data.travelStyle = travelStyle;
  }

  if ('featured' in record) {
    if (typeof record.featured !== 'boolean') errors.featured = 'featured must be a boolean.';
    else data.featured = record.featured;
  }

  if ('metadata' in record) {
    const metadata = validateMetadata(record.metadata, errors);
    if (metadata) data.metadata = metadata;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, error: 'Validation failed.', errors };
  }
  return { success: true, data };
}
