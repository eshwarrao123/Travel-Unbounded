import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEnquiry extends Document {
  fullName: string;
  countryCode: string;
  contactNumber: string;
  email: string;
  dateOfTravel: Date;
  numberOfPeople: number;
  hotelCategory: string;
  numberOfChildren?: number;
  createdAt: Date;
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
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Use existing model if it exists, otherwise create a new one
const Enquiry: Model<IEnquiry> = mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
