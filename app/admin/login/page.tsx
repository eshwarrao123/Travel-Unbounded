'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address.');
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
        setErrorMessage(data.message || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMessage('Unable to connect to authentication service. Please try again.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@gmail.com');
    setPassword('TravelAdmin@123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fafaf9]">
      {/* Editorial Visual Left Panel */}
      <div className="relative w-full lg:w-1/2 min-h-[200px] sm:min-h-[240px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 text-white overflow-hidden bg-[#0c241b] shrink-0">
        {/* Background Image with warm editorial scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2940&auto=format&fit=crop")`,
          }}
        />
        {/* Editorial overlay: subtle dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/55" />
        <div className="absolute inset-0 bg-[#0f4c3a]/25 mix-blend-multiply" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold tracking-tight text-white">
            Travel Unbounded
          </span>
          <span className="text-xs text-white/60 font-light">/ Admin</span>
        </div>

        {/* Center / Editorial Statement */}
        <div className="relative z-10 my-auto py-4 lg:py-0 max-w-lg">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.14] mb-2 sm:mb-3">
            Curating extraordinary journeys across the globe.
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-white/80 font-light leading-relaxed hidden sm:block">
            Internal operations workspace for bespoke expedition management, client enquiries, and global destinations.
          </p>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 text-xs text-white/50 flex items-center justify-between pt-3 border-t border-white/15">
          <span>Masai Mara National Reserve, Kenya</span>
          <span className="font-mono text-[11px] hidden sm:inline">Expedition Catalog</span>
        </div>
      </div>

      {/* Authentication Right Panel */}
      <div className="w-full lg:w-1/2 flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 bg-[#fafaf9] border-t lg:border-t-0 lg:border-l border-stone-200">
        {/* Centered Form Container (380-440px width) */}
        <div className="w-full max-w-[420px] my-auto py-6 sm:py-8">
          {/* Section Eyebrow & Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Travel Unbounded
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-medium text-stone-500">
                Administrative Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-1.5">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Enter your administrator credentials to access the management portal.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5"
            >
              <svg
                className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Email address
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
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-md text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0f4c3a] focus:ring-2 focus:ring-[#0f4c3a]/15 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
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
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-md text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0f4c3a] focus:ring-2 focus:ring-[#0f4c3a]/15 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#0f4c3a] hover:bg-[#0c3d2e] text-white text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] shadow-xs"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Evaluator Credentials Card */}
          <div className="mt-6 p-4 bg-white border border-stone-200/90 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                Evaluator Access
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1 text-xs text-[#0f4c3a] hover:text-[#0c3d2e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
              >
                <span>Auto-fill</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-stone-700 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-sans text-[11px]">Email</span>
                <span className="font-medium text-stone-800">admin@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-sans text-[11px]">Password</span>
                <span className="font-medium text-stone-800">TravelAdmin@123</span>
              </div>
            </div>
          </div>

          {/* Quiet Link to Public Site */}
          <div className="mt-6 pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-400">
            <span>&copy; {new Date().getFullYear()} Travel Unbounded</span>
            <Link
              href="/"
              className="text-stone-500 hover:text-[#0f4c3a] transition-colors flex items-center gap-1"
            >
              <span>View public site</span>
              <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fafaf9]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#0f4c3a] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-normal">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
