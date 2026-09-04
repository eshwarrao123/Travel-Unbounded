'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Successful login -> Redirect to destination or dashboard
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMessage('Unable to connect to the authentication service. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid md:grid-cols-2 gap-0 max-w-5xl bg-white rounded-lg border border-[var(--color-border)] shadow-lg overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col justify-between bg-[var(--color-accent)] text-white p-12">
        <div>
          <h2 className="text-3xl font-light mb-3 tracking-tight">
            Travel Unbounded
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Administrative Portal
          </p>
        </div>
        
        <div className="space-y-4 text-sm text-white/70">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="font-medium text-white mb-1">Secure Access</p>
              <p className="text-xs leading-relaxed">End-to-end encrypted session management</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className="font-medium text-white mb-1">Real-time Operations</p>
              <p className="text-xs leading-relaxed">Manage enquiries and destinations instantly</p>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-white/50 pt-8 border-t border-white/10">
          <p>Bangalore, India • Since 2008</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="p-8 md:p-12 flex flex-col justify-center">
        <div className="mb-8">
          <div className="md:hidden mb-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Travel Unbounded
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-1">
              Admin Portal
            </p>
          </div>
          
          <h1 className="text-2xl font-medium text-[var(--color-text-primary)] mb-2">
            Sign In
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Access the administrative dashboard
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5"
          >
            <svg
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="admin@gmail.com"
              className="w-full px-4 py-2.5 bg-white border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-white border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 btn btn-primary py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Evaluator Helper Notice */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-tertiary)]">Evaluator Account</span>
            <code className="font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] px-2 py-1 rounded">
              admin@gmail.com
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg-secondary)] flex items-center justify-center p-6 overflow-y-auto">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-lg border border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
          Loading sign in portal...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
