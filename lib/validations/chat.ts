import { ChatMessage, ChatRequest, ChatRole } from '@/types/chat';

export const MAX_CONVERSATION_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TOTAL_HISTORY_LENGTH = 10000;

export interface ValidationSuccess {
  success: true;
  data: ChatRequest;
}

export interface ValidationFailure {
  success: false;
  error: string;
}

export type ChatValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates incoming chat request body server-side.
 * Enforces schema integrity, message length limits, role validity, and prevents oversized abuse.
 */
export function validateChatRequest(body: unknown): ChatValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      success: false,
      error: 'Invalid request body: Expected a JSON object with a messages array.',
    };
  }

  const { messages } = body as Record<string, unknown>;

  if (!messages || !Array.isArray(messages)) {
    return {
      success: false,
      error: 'Invalid request: "messages" field must be an array.',
    };
  }

  if (messages.length === 0) {
    return {
      success: false,
      error: 'Conversation history cannot be empty. At least one user message is required.',
    };
  }

  if (messages.length > MAX_CONVERSATION_MESSAGES) {
    return {
      success: false,
      error: `Conversation history exceeds maximum limit of ${MAX_CONVERSATION_MESSAGES} messages.`,
    };
  }

  const sanitizedMessages: ChatMessage[] = [];
  let totalCharacters = 0;

  for (let i = 0; i < messages.length; i++) {
    const item = messages[i];

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return {
        success: false,
        error: `Message at index ${i} is invalid. Expected an object with "role" and "content".`,
      };
    }

    const { role, content } = item as Record<string, unknown>;

    // 1. Role verification
    if (role !== 'user' && role !== 'assistant') {
      return {
        success: false,
        error: `Invalid role "${role}" at message ${i}. Must be either "user" or "assistant".`,
      };
    }

    // 2. Content verification
    if (typeof content !== 'string') {
      return {
        success: false,
        error: `Message content at index ${i} must be a string.`,
      };
    }

    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return {
        success: false,
        error: `Message content at index ${i} cannot be empty.`,
      };
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return {
        success: false,
        error: `Message at index ${i} exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
      };
    }

    totalCharacters += trimmed.length;

    sanitizedMessages.push({
      role: role as ChatRole,
      content: trimmed,
    });
  }

  if (totalCharacters > MAX_TOTAL_HISTORY_LENGTH) {
    return {
      success: false,
      error: `Total conversation length exceeds maximum limit of ${MAX_TOTAL_HISTORY_LENGTH} characters.`,
    };
  }

  // The final message in the sequence must be from the user
  const lastMessage = sanitizedMessages[sanitizedMessages.length - 1];
  if (lastMessage.role !== 'user') {
    return {
      success: false,
      error: 'The most recent message in the conversation must be from the "user".',
    };
  }

  return {
    success: true,
    data: {
      messages: sanitizedMessages,
    },
  };
}
