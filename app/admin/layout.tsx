import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Portal | Travel Unbounded',
  description: 'Administrative portal for Travel Unbounded management.',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-bg-secondary)] flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)] hover:opacity-90 transition-opacity"
            >
              Travel Unbounded
            </Link>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5"
            >
              <span>View Public Site</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
