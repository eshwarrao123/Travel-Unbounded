'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ChatWidgetPublic from '@/components/chat/ChatWidgetPublic';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  // When visiting any /admin route (including /admin/login),
  // NEVER mount the public navbar, footer, or chatbot.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For public website routes, mount the complete public shell
  return (
    <>
      <Navigation />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <ChatWidgetPublic />
    </>
  );
}
