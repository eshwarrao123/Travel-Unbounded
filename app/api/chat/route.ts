import { NextResponse } from 'next/server';
import { validateChatRequest } from '@/lib/validations/chat';
import { generateTravelChatResponse, AiError } from '@/lib/ai/gemini';
import { ChatErrorResponse, ChatResponse } from '@/types/chat';

export async function POST(request: Request): Promise<NextResponse<ChatResponse | ChatErrorResponse>> {
  try {
    // 1. Safely parse JSON payload
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid or malformed JSON payload.',
          },
        },
        { status: 400 }
      );
    }

    // 2. Validate conversation history and message boundaries
    const validation = validateChatRequest(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    // 3. Generate structured AI travel response
    const chatData = await generateTravelChatResponse(validation.data.messages);

    // 4. Return stable structured success response
    return NextResponse.json(
      {
        success: true,
        data: chatData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof AiError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    console.error('Unhandled API /api/chat error:', error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: "An unexpected error occurred while planning your journey. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
