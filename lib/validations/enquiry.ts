export interface EnquiryPayload {
  fullName: unknown;
  countryCode: unknown;
  contactNumber: unknown;
  email: unknown;
  dateOfTravel: unknown;
  numberOfPeople: unknown;
  hotelCategory: unknown;
  numberOfChildren?: unknown;
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
  if (!payload.dateOfTravel) {
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

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data };
}
