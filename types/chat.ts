/**
 * Client-facing and server-side chat API contracts for Travel Unbounded AI Travel Assistant.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface TripDetails {
  destination: string | null;
  durationDays: number | null;
  budget: string | null;
  travelers: number | null;
  interests: string[];
  travelDates: string | null;
}

export interface ItineraryDay {
  day: number;
  title: string;
  highlight: string;
  activities: string[];
}

export interface ChatResponseData {
  isItineraryReady: boolean;
  reply: string;
  tripTitle: string | null;
  tripDetails: TripDetails;
  itinerary: ItineraryDay[] | null;
}

export interface ChatResponse {
  success: true;
  data: ChatResponseData;
}

export type ChatErrorCode =
  | 'INVALID_REQUEST'
  | 'AI_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR';

export interface ChatErrorResponse {
  success: false;
  error: {
    code: ChatErrorCode;
    message: string;
  };
}

export type ChatApiResponse = ChatResponse | ChatErrorResponse;
