import mongoose, { Document, Model, Schema } from 'mongoose';
import { EnquiryStatus, ALLOWED_ENQUIRY_STATUSES } from '@/types/enquiry';

export interface IEnquiry extends Document {
  fullName: string;
  countryCode: string;
  contactNumber: string;
  email: string;
  dateOfTravel: Date;
  numberOfPeople: number;
  hotelCategory: string;
  numberOfChildren?: number;
  status: EnquiryStatus;
  destinationSlug?: string;
  destinationName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema: Schema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  countryCode: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  dateOfTravel: {
    type: Date,
    required: true,
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
  },
  hotelCategory: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Luxury'],
  },
  numberOfChildren: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ALLOWED_ENQUIRY_STATUSES,
    default: 'New',
    required: true,
    index: true,
  },
  destinationSlug: {
    type: String,
    trim: true,
    lowercase: true,
    index: true,
    default: undefined,
  },
  destinationName: {
    type: String,
    trim: true,
    default: undefined,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optimization indexes for admin search, status filtering, and chronological sorting
EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ destinationSlug: 1 });

// Ensure updated schema fields take effect across Next.js dev server reloads
if (process.env.NODE_ENV !== 'production' && mongoose.models.Enquiry) {
  delete (mongoose.models as Record<string, unknown>).Enquiry;
}

// Use existing model if it exists, otherwise create a new one
const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;


