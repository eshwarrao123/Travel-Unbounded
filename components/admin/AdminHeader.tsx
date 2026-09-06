'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  userEmail?: string;
  title?: string;
}

export default function AdminHeader({ userEmail, title }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  // Derive current section for breadcrumb
  const currentSection =
    title ||
    (pathname === '/admin/dashboard'
      ? 'Overview'
      : pathname === '/admin/enquiries'
      ? 'Enquiries'
      : pathname === '/admin/destinations'
      ? 'Destinations'
      : 'Admin');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] px-6 lg:px-10 py-3.5 hidden md:block">
      <div className="flex items-center justify-between">
        {/* Left: Section Context */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--color-text-tertiary)] font-normal">Travel Unbounded</span>
          <span className="text-[var(--color-border-strong)]">/</span>
          <span className="text-[var(--color-text-primary)] font-medium">{currentSection}</span>
        </div>

        {/* Right: user + public site + sign out */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-xs text-[var(--color-text-secondary)] font-normal">
              {userEmail}
            </span>
          )}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5 font-normal"
          >
            <span>Public site</span>
            <svg className="w-3 h-3 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>

          {userEmail && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs px-2.5 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-300 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-normal active:scale-[0.98]"
            >
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

