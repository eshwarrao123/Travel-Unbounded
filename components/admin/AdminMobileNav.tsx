'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/enquiries',
    label: 'Enquiries',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: '/admin/destinations',
    label: 'Destinations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer when route changes
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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

  const currentPage = navItems.find((item) => item.href === pathname)?.label ?? 'Admin';

  return (
    <>
      {/* Mobile Top Bar — only shown on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 h-14 shrink-0">
        {/* Brand and Page indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <div>
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Travel Unbounded
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)] ml-1.5">
              / {currentPage}
            </span>
          </div>
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          className="flex items-center justify-center w-9 h-9 rounded text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors active:scale-[0.96]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Spacer to push content below mobile top bar on small screens */}
      <div className="md:hidden h-14 shrink-0" aria-hidden="true" />

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-[80] w-64 bg-white flex flex-col shadow-xl transition-transform duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
                Travel Unbounded
              </span>
            </div>
            <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)] font-normal">
              Admin
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors cursor-pointer active:scale-[0.96]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded text-sm
                      transition-colors duration-150
                      ${
                        isActive
                          ? 'bg-[#edf5f1] text-[var(--color-accent)] font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] font-normal'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Drawer Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--color-border)] space-y-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-normal text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View public site</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full text-left text-xs font-normal text-stone-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

