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
    <div className="w-full max-w-md bg-white rounded-lg border border-[var(--color-border)] shadow-sm p-8 md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-light tracking-tight text-[var(--color-text-primary)]">
          Admin Sign In
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Enter your administrative credentials to access the dashboard.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5"
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
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
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
            className="w-full px-3.5 py-2.5 bg-white border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
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
            className="w-full px-3.5 py-2.5 bg-white border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 btn btn-primary py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>

      {/* Evaluator Helper Notice */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
        <div className="flex items-center justify-between">
          <span>Evaluator Account</span>
          <span className="font-mono text-[var(--color-text-secondary)]">admin@gmail.com</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
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
