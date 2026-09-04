'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from 'react';
import { ChatMessage as ChatMessageType, ChatApiResponse, ChatResponseData } from '@/types/chat';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const WELCOME_MESSAGE =
  "Tell me what kind of journey you're dreaming about — the destination, how long you'd like to travel, who's joining you — and I'll craft every detail.";

const INITIAL_ASSISTANT_MESSAGE: ChatMessageType = {
  role: 'assistant',
  content: WELCOME_MESSAGE,
};

const QUICK_REPLIES = [
  'Wildlife Safari',
  'Beach Escape',
  'Mountain Adventure',
  'Cultural Journey',
];

interface ChatWindowProps {
  onClose: () => void;
}

interface MessageWithData {
  message: ChatMessageType;
  responseData?: ChatResponseData;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [items, setItems] = useState<MessageWithData[]>([
    { message: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [items, loading, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Abort on unmount
  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      setError(null);
      setInput('');

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      const userMessage: ChatMessageType = { role: 'user', content: trimmed };
      setItems((prev) => [...prev, { message: userMessage }]);
      setLoading(true);

      const historyForApi: ChatMessageType[] = [
        ...items.map((item) => item.message),
        userMessage,
      ];

      try {
        abortControllerRef.current = new AbortController();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyForApi }),
          signal: abortControllerRef.current.signal,
        });

        const json: ChatApiResponse = await res.json();

        if (!json.success) {
          setError(json.error.message || "I'm having trouble reaching the travel planner right now. Please try again.");
        } else {
          const assistantMessage: ChatMessageType = {
            role: 'assistant',
            content: json.data.reply,
          };
          setItems((prev) => [
            ...prev,
            { message: assistantMessage, responseData: json.data },
          ]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError("I'm having trouble reaching the travel planner right now. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [items, loading]
  );

  const handleSubmit = () => sendMessage(input);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartOver = () => {
    abortControllerRef.current?.abort();
    setItems([{ message: INITIAL_ASSISTANT_MESSAGE }]);
    setInput('');
    setLoading(false);
    setError(null);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const showChips = items.length <= 1 && !loading;

  return (
    <div
      id="chat-planner-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Travel Unbounded AI Travel Planner"
      className="chat-panel"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="chat-header">
        <div>
          <p className="chat-header-title">Travel Planner</p>
          <p className="chat-header-sub">Travel Unbounded · AI-assisted</p>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Start Over */}
          <button
            onClick={handleStartOver}
            disabled={loading}
            className="chat-icon-btn"
            aria-label="Start a new conversation"
            title="Start over"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="chat-icon-btn"
            aria-label="Close travel planner"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div
        className="chat-messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((item, idx) => (
          <ChatMessage
            key={idx}
            message={item.message}
            responseData={item.responseData}
          />
        ))}

        {loading && <TypingIndicator />}

        {error && !loading && (
          <div className="chat-error">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="chat-error-dismiss"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Reply Chips ────────────────────────────────────── */}
      {showChips && (
        <div className="chat-chips">
          {QUICK_REPLIES.map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              className="chat-chip"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Composer ─────────────────────────────────────────────── */}
      <div className="chat-composer">
        <label htmlFor="chat-input" className="sr-only">
          Message the Travel Unbounded planner
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Describe your dream journey…"
          className="chat-input"
          aria-label="Type your travel planning message"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="chat-send-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
