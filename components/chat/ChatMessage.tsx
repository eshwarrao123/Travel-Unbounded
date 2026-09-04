'use client';

import { ChatMessage as ChatMessageType, ChatResponseData } from '@/types/chat';
import ItineraryDisplay from './ItineraryDisplay';

interface ChatMessageProps {
  message: ChatMessageType;
  responseData?: ChatResponseData;
}

export default function ChatMessage({ message, responseData }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="chat-msg-row chat-msg-row--user">
        <p className="chat-msg-user">{message.content}</p>
      </div>
    );
  }

  const hasItinerary =
    responseData?.isItineraryReady &&
    responseData.itinerary &&
    responseData.itinerary.length > 0;

  return (
    <div className="chat-msg-row chat-msg-row--assistant">
      <p className="chat-msg-assistant">{message.content}</p>
      {hasItinerary && responseData && (
        <div className="chat-itinerary-wrapper">
          <ItineraryDisplay
            tripTitle={responseData.tripTitle}
            tripDetails={responseData.tripDetails}
            itinerary={responseData.itinerary!}
          />
        </div>
      )}
    </div>
  );
}
