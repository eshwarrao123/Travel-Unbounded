'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const openChat = useCallback(() => {
    setOpen(true);
    setHasOpened(true);
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (open) {
      closeChat();
    } else {
      openChat();
    }
  }, [open, openChat, closeChat]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) closeChat();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closeChat]);

  return (
    <>
      {/* Chat window panel — mounted once, visibility via CSS */}
      {hasOpened && (
        <div
          aria-hidden={!open}
          className="fixed z-50"
          style={{
            bottom: '5rem',
            right: '1.5rem',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          <ChatWindow onClose={closeChat} />
        </div>
      )}

      {/* Floating trigger */}
      <div className="fixed z-50" style={{ bottom: '1.5rem', right: '1.5rem' }}>
        <button
          id="chat-widget-trigger"
          onClick={toggleChat}
          aria-label={open ? 'Close travel planner' : 'Open AI travel planner'}
          aria-expanded={open}
          aria-controls="chat-planner-dialog"
          className="chat-trigger-btn"
        >
          {/* Compass icon */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </>
            )}
          </svg>
          <span>{open ? 'Close' : 'Plan a Trip'}</span>
        </button>
      </div>
    </>
  );
}
