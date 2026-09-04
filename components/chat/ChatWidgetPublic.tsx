'use client';

import { usePathname } from 'next/navigation';
import ChatWidget from './ChatWidget';

/**
 * Public-only wrapper for ChatWidget
 * Prevents the chatbot from appearing on /admin routes
 */
export default function ChatWidgetPublic() {
  const pathname = usePathname();
  
  // Do not render on any admin route
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <ChatWidget />;
}
