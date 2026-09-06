export type EnquiryStatus = 'New' | 'Contacted' | 'Converted' | 'Closed';

export const ALLOWED_ENQUIRY_STATUSES: readonly EnquiryStatus[] = [
  'New',
  'Contacted',
  'Converted',
  'Closed',
] as const;

export interface AdminEnquiryItem {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  contactNumber: string;
  travelDate: string;
  dateOfTravel: string;
  people: number;
  numberOfPeople: number;
  hotelCategory: string;
  numberOfChildren: number;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface EnquiryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminEnquiryListResponse {
  success: true;
  data: {
    enquiries: AdminEnquiryItem[];
    pagination: EnquiryPagination;
  };
}

export interface AdminEnquiryUpdateResponse {
  success: true;
  data: AdminEnquiryItem;
  message: string;
}

export interface EnquiryErrorResponse {
  success: false;
  error: {
    code: 'INVALID_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    details?: Record<string, string>;
  };
}
