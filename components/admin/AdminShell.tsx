'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import AdminMobileNav from '@/components/admin/AdminMobileNav';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login' || (pathname ? pathname.startsWith('/admin/login') : false);

  // If on the login page, render children standalone with zero admin shell chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authenticated Admin Shell
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg-secondary)] flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-[var(--color-border)] shrink-0 select-none">
        {/* Sidebar Header */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-[var(--color-border)]">
          <Link href="/admin/dashboard" className="block group">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Travel Unbounded
              </span>
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-tertiary)] font-normal">
              Admin
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 overflow-y-auto admin-scroll">
          <AdminNav />
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-[var(--color-border)]">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors font-normal group"
          >
            <svg
              className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>View public site</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Nav (top bar + slide drawer) */}
      <AdminMobileNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
