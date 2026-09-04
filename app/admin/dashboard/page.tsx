'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [loggingOut, setLoggingOut] = useState(false);

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
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
          <svg className="animate-spin h-5 w-5 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
      {/* Header bar */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Authenticated Session</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[var(--color-text-primary)] mt-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Logged in as <span className="font-medium text-[var(--color-text-primary)]">{adminUser?.email}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn btn-secondary py-2.5 px-5 text-sm self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>

      {/* Verification status card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h2 className="text-base font-medium text-[var(--color-text-primary)]">
              Authentication Architecture
            </h2>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Phase 2 — Step 1
            </span>
          </div>

          <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>MongoDB User collection with bcrypt password hashing</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Encrypted JWT session stored in secure <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">httpOnly</code> cookie</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Next.js Edge Middleware route interception on <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">/admin/*</code></span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Protected server-side verification helper (<code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">requireAdmin()</code>)</span>
            </li>
          </ul>
        </div>

        {/* Server-side verification test trigger */}
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h2 className="text-base font-medium text-[var(--color-text-primary)]">
              API Security Verification
            </h2>
            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              Live Test
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Test server-side cookie verification by sending a request to the protected <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">GET /api/admin/auth/me</code> route handler.
          </p>

          <button
            onClick={handleVerifyApiAccess}
            disabled={checkingApi}
            className="btn btn-primary py-2.5 px-4 text-sm w-full cursor-pointer disabled:opacity-60"
          >
            {checkingApi ? 'Verifying with server...' : 'Verify Protected API Route'}
          </button>

          {apiCheckStatus && (
            <div className={`p-3 rounded text-xs border ${
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
  );
}
