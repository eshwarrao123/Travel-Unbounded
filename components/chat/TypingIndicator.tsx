'use client';

export default function TypingIndicator() {
  return (
    <div
      className="chat-typing"
      role="status"
      aria-label="Travel planner is working"
    >
      <span className="chat-typing-label">Planning your journey</span>
      <span className="chat-typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
