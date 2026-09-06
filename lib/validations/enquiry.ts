export interface EnquiryPayload {
  fullName: unknown;
  countryCode: unknown;
  contactNumber: unknown;
  email: unknown;
  dateOfTravel: unknown;
  numberOfPeople: unknown;
  hotelCategory: unknown;
  numberOfChildren?: unknown;
  destinationSlug?: unknown;
}

export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string>;
  data?: Record<string, unknown>;
}

export function validateEnquiry(payload: EnquiryPayload): ValidationResult {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};

  // fullName validation
  if (!payload.fullName || typeof payload.fullName !== 'string') {
    errors.fullName = 'Full name is required.';
  } else {
    const trimmed = payload.fullName.trim();
    if (trimmed.length === 0) {
      errors.fullName = 'Full name cannot be empty.';
    } else {
      data.fullName = trimmed;
    }
  }

  // countryCode validation
  if (!payload.countryCode || typeof payload.countryCode !== 'string') {
    errors.countryCode = 'Country code is required.';
  } else {
    const trimmed = payload.countryCode.trim();
    if (trimmed.length === 0) {
      errors.countryCode = 'Country code cannot be empty.';
    } else {
      data.countryCode = trimmed;
    }
  }

  // contactNumber validation
  if (!payload.contactNumber || typeof payload.contactNumber !== 'string') {
    errors.contactNumber = 'Contact number is required.';
  } else {
    const trimmed = payload.contactNumber.trim();
    // Allow basic phone number characters and lengths between 7 and 15
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(trimmed)) {
      errors.contactNumber = 'Please enter a valid contact number (7-15 digits).';
    } else {
      data.contactNumber = trimmed;
    }
  }

  // email validation
  if (!payload.email || typeof payload.email !== 'string') {
    errors.email = 'Email address is required.';
  } else {
    const trimmed = payload.email.trim();
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      errors.email = 'Please enter a valid email address.';
    } else {
      data.email = trimmed.toLowerCase();
    }
  }

  // dateOfTravel validation
  if (!payload.dateOfTravel || typeof payload.dateOfTravel !== 'string') {
    errors.dateOfTravel = 'Date of travel is required.';
  } else {
    const travelDate = new Date(payload.dateOfTravel);
    if (isNaN(travelDate.getTime())) {
      errors.dateOfTravel = 'Invalid date format.';
    } else {
      // Must be strictly in the future. Today is NOT allowed.
      // Compare against start of tomorrow
      const now = new Date();
      // Start of today in local server time
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Calculate start of tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (travelDate < tomorrow) {
        errors.dateOfTravel = 'Date of travel must be in the future.';
      } else {
        data.dateOfTravel = travelDate;
      }
    }
  }

  // numberOfPeople validation
  if (payload.numberOfPeople === undefined || payload.numberOfPeople === null) {
    errors.numberOfPeople = 'Number of people is required.';
  } else {
    const num = Number(payload.numberOfPeople);
    if (isNaN(num) || !Number.isInteger(num) || num < 1) {
      errors.numberOfPeople = 'Number of people must be at least 1.';
    } else {
      data.numberOfPeople = num;
    }
  }

  // hotelCategory validation
  if (!payload.hotelCategory || typeof payload.hotelCategory !== 'string') {
    errors.hotelCategory = 'Hotel category is required.';
  } else {
    const validCategories = ['Standard', 'Deluxe', 'Luxury'];
    if (!validCategories.includes(payload.hotelCategory)) {
      errors.hotelCategory = 'Invalid hotel category selected.';
    } else {
      data.hotelCategory = payload.hotelCategory;
    }
  }

  // numberOfChildren validation (optional)
  if (payload.numberOfChildren !== undefined && payload.numberOfChildren !== null && payload.numberOfChildren !== '') {
    const numChildren = Number(payload.numberOfChildren);
    if (isNaN(numChildren) || !Number.isInteger(numChildren) || numChildren < 0) {
      errors.numberOfChildren = 'Number of children cannot be negative.';
    } else {
      data.numberOfChildren = numChildren;
    }
  } else {
    data.numberOfChildren = 0;
  }

  // destinationSlug validation (optional)
  if (
    payload.destinationSlug !== undefined &&
    payload.destinationSlug !== null &&
    payload.destinationSlug !== ''
  ) {
    if (typeof payload.destinationSlug !== 'string') {
      errors.destinationSlug = 'Destination must be a string.';
    } else {
      const trimmedSlug = payload.destinationSlug.trim().toLowerCase();
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!trimmedSlug || !slugRegex.test(trimmedSlug)) {
        errors.destinationSlug = 'Invalid destination format.';
      } else {
        data.destinationSlug = trimmedSlug;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data };
}

export { ALLOWED_ENQUIRY_STATUSES, type EnquiryStatus } from '@/types/enquiry';

export interface ValidatedEnquiryQueryParams {
  page: number;
  limit: number;
  status?: import('@/types/enquiry').EnquiryStatus;
  search?: string;
}

export type QueryValidationResult =
  | { success: true; data: ValidatedEnquiryQueryParams }
  | { success: false; error: string };

/**
 * Validates and normalizes query parameters for GET /api/enquiry
 */
export function validateEnquiryQueryParams(searchParams: URLSearchParams): QueryValidationResult {
  let page = 1;
  let limit = 10;
  let status: import('@/types/enquiry').EnquiryStatus | undefined;
  let search: string | undefined;

  // 1. Validate page
  const rawPage = searchParams.get('page');
  if (rawPage !== null && rawPage !== '') {
    const parsedPage = Number(rawPage);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return {
        success: false,
        error: 'Query parameter "page" must be an integer greater than or equal to 1.',
      };
    }
    page = parsedPage;
  }

  // 2. Validate limit
  const rawLimit = searchParams.get('limit');
  if (rawLimit !== null && rawLimit !== '') {
    const parsedLimit = Number(rawLimit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return {
        success: false,
        error: 'Query parameter "limit" must be an integer between 1 and 50.',
      };
    }
    limit = parsedLimit;
  }

  // 3. Validate status
  const rawStatus = searchParams.get('status');
  if (rawStatus !== null && rawStatus.trim() !== '') {
    const trimmedStatus = rawStatus.trim();
    const validStatuses = ['New', 'Contacted', 'Converted', 'Closed'];
    if (!validStatuses.includes(trimmedStatus)) {
      return {
        success: false,
        error: `Invalid enquiry status "${trimmedStatus}". Allowed values are: ${validStatuses.join(', ')}.`,
      };
    }
    status = trimmedStatus as import('@/types/enquiry').EnquiryStatus;
  }

  // 4. Validate search
  const rawSearch = searchParams.get('search');
  if (rawSearch !== null && rawSearch.trim() !== '') {
    const trimmedSearch = rawSearch.trim();
    if (trimmedSearch.length > 100) {
      return {
        success: false,
        error: 'Query parameter "search" must not exceed 100 characters.',
      };
    }
    search = trimmedSearch;
  }

  return {
    success: true,
    data: {
      page,
      limit,
      status,
      search,
    },
  };
}

export type StatusUpdateValidationResult =
  | { success: true; data: { status: import('@/types/enquiry').EnquiryStatus } }
  | { success: false; error: string };

/**
 * Validates request payload for PATCH /api/enquiry/[id]
 */
export function validateStatusUpdate(payload: unknown): StatusUpdateValidationResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      success: false,
      error: 'Request body must be a valid JSON object.',
    };
  }

  const record = payload as Record<string, unknown>;
  const validStatuses = ['New', 'Contacted', 'Converted', 'Closed'];

  if (!('status' in record) || typeof record.status !== 'string') {
    return {
      success: false,
      error: 'Field "status" is required and must be a string.',
    };
  }

  const trimmedStatus = record.status.trim();
  if (!validStatuses.includes(trimmedStatus)) {
    return {
      success: false,
      error: `Invalid enquiry status "${record.status}". Allowed values are: ${validStatuses.join(', ')}.`,
    };
  }

  return {
    success: true,
    data: {
      status: trimmedStatus as import('@/types/enquiry').EnquiryStatus,
    },
  };
}

/**
 * Validates whether a given string is a valid 24-character hexadecimal MongoDB ObjectId
 */
export function isValidObjectId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Escapes regex special characters to prevent ReDoS / injection
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

