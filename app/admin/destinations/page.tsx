'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import DestinationsManager from '@/components/admin/DestinationsManager';

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

export default function AdminDestinationsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verify admin session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          setAdminUser(data.user);
        } else {
          router.replace('/admin/login');
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <svg className="animate-spin h-5 w-5 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Verifying admin session...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader userEmail={adminUser?.email} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
                Admin / Destinations
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-[var(--color-text-primary)] mb-2">
              Destinations
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage the destination catalog shown on the public website
            </p>
          </div>

          {/* Destinations Manager */}
          <DestinationsManager />
        </div>
      </main>
    </>
  );
}
