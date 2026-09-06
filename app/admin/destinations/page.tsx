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
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <svg className="animate-spin h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading destinations...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader userEmail={adminUser?.email} title="Destinations" />

      <main className="flex-1 overflow-y-auto bg-[var(--color-bg-secondary)] admin-scroll">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10 space-y-6">
          {/* Editorial Page Header */}
          <div className="pb-6 border-b border-[var(--color-border)]">
            <h1 className="text-3xl sm:text-4xl font-light text-[var(--color-text-primary)] mb-1.5 tracking-tight">
              Destinations
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xl font-normal">
              Curate and publish journeys across India and International wilderness reserves.
            </p>
          </div>

          {/* Destinations Manager */}
          <DestinationsManager />
        </div>
      </main>
    </>
  );
}
