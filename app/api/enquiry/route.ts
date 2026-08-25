import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import { validateEnquiry } from '@/lib/validations/enquiry';

export async function POST(request: Request) {
  try {
    // 1. Parse JSON safely
    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or malformed JSON body.' },
        { status: 400 }
      );
    }

    // 2. Validate payload server-side
    const validation = validateEnquiry(payload);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed.', 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // 3. Connect to MongoDB
    await connectToDatabase();

    // 4. Create an Enquiry document
    // Data is normalized by the validation layer
    const enquiry = new Enquiry(validation.data);

    // 5. Save it
    await enquiry.save();

    // 6. Return JSON response
    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /enquiry error:', error);
    
    // Distinguish generic server errors vs connection errors
    return NextResponse.json(
      { success: false, message: 'Unable to submit enquiry right now. Please try again later.' },
      { status: 500 }
    );
  }
}
