import type { Metadata } from 'next';
import AdminNav from '@/components/admin/AdminNav';

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
    <div className="fixed inset-0 z-50 bg-[var(--color-bg-secondary)]">
      <div className="h-full flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-[var(--color-border)]">
          {/* Sidebar Header */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                Travel Unbounded
              </span>
            </div>
            <div className="mt-1 text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
              Admin Portal
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            <AdminNav />
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-[var(--color-border)]">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View Public Site</span>
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
