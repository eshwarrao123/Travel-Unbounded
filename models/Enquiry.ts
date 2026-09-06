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

// Use existing model if it exists, otherwise create a new one
const Enquiry: Model<IEnquiry> = mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;

