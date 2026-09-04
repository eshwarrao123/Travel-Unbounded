'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  userEmail?: string;
}

export default function AdminHeader({ userEmail }: AdminHeaderProps) {
  const router = useRouter();
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            Travel Unbounded
          </h1>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] uppercase tracking-wider">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">
              {userEmail}
            </span>
          )}
          
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors hidden md:flex items-center gap-1.5"
          >
            <span>Public Site</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {userEmail && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm px-3 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
