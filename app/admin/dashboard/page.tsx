'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiCheckStatus, setApiCheckStatus] = useState<string | null>(null);
  const [checkingApi, setCheckingApi] = useState(false);

  // Fetch verified admin profile on mount
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

  const handleVerifyApiAccess = async () => {
    setCheckingApi(true);
    setApiCheckStatus(null);
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (res.ok && data.success) {
        setApiCheckStatus(`Verified! Protected server endpoint returned 200 OK for ${data.user.email} (Role: ${data.user.role}).`);
      } else {
        setApiCheckStatus('API verification rejected: ' + (data.message || 'Unauthorized'));
      }
    } catch {
      setApiCheckStatus('Failed to communicate with protected API.');
    } finally {
      setCheckingApi(false);
    }
  };

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
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
          {/* Welcome Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                Authenticated Session
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-[var(--color-text-primary)] mb-2">
              Overview
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Welcome to the Travel Unbounded administrative portal
            </p>
          </div>

          {/* Quick Stats Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Enquiries
                </h3>
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] italic">
                Live data integration pending
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Destinations
                </h3>
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] italic">
                CMS integration pending
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Analytics
                </h3>
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] italic">
                Metrics integration pending
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  Authentication Architecture
                </h2>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">
                  Phase 2 — Step 1
                </span>
              </div>

              <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>MongoDB User collection with bcrypt password hashing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Encrypted JWT session stored in secure <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">httpOnly</code> cookie</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Next.js Edge Middleware route interception on <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">/admin/*</code></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Protected server-side verification helper (<code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">requireAdmin()</code>)</span>
                </li>
              </ul>
            </div>

            {/* API Verification Test */}
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  API Security Test
                </h2>
                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  Live
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Verify server-side cookie authentication by sending a request to the protected <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">GET /api/admin/auth/me</code> route handler.
              </p>

              <button
                onClick={handleVerifyApiAccess}
                disabled={checkingApi}
                className="btn btn-primary py-2.5 px-4 text-sm w-full cursor-pointer disabled:opacity-60"
              >
                {checkingApi ? 'Verifying with server...' : 'Verify Protected API Route'}
              </button>

              {apiCheckStatus && (
                <div className={`p-3.5 rounded text-xs leading-relaxed border ${
                  apiCheckStatus.startsWith('Verified!')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {apiCheckStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
