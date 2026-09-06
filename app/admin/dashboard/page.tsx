'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  AnalyticsSummary,
  StatusBreakdownItem,
} from '@/types/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

const STATUS_COLORS: Record<string, string> = {
  New: '#3b82f6',        // Bright calm blue
  Contacted: '#d97706',  // Amber / Warm terracotta
  Converted: '#0f4c3a',  // Brand deep forest green
  Closed: '#71717a',     // Neutral zinc / slate
};

// Custom tooltip for Monthly Volume Bar Chart
function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    const count = payload[0].value;
    return (
      <div className="bg-white border border-[var(--color-border)] px-3 py-2 rounded shadow-sm text-xs">
        <p className="font-medium text-[var(--color-text-primary)] mb-0.5">{label}</p>
        <p className="text-[var(--color-accent)] font-semibold">
          {count} {count === 1 ? 'enquiry' : 'enquiries'}
        </p>
      </div>
    );
  }
  return null;
}

// Custom tooltip for Status Donut Chart
function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StatusBreakdownItem }>;
}) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const color = STATUS_COLORS[item.status] || '#71717a';
    return (
      <div className="bg-white border border-[var(--color-border)] px-3 py-2 rounded shadow-sm text-xs">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-[var(--color-text-primary)]">{item.status}</span>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          {item.count} {item.count === 1 ? 'lead' : 'leads'} ({item.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMounted();

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // 1. Verify admin session
      const authRes = await fetch('/api/admin/auth/me');
      if (!authRes.ok) {
        router.replace('/admin/login');
        return;
      }
      const authData = await authRes.json();
      if (authData.success && authData.user) {
        setAdminUser(authData.user);
      } else {
        router.replace('/admin/login');
        return;
      }

      // 2. Fetch live analytics summary
      const analyticsRes = await fetch('/api/analytics/summary');
      if (analyticsRes.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (!analyticsRes.ok) {
        throw new Error('Failed to retrieve analytics data from server.');
      }
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success && analyticsData.data) {
        setAnalytics(analyticsData.data);
      } else {
        throw new Error(analyticsData.error?.message || 'Invalid analytics response.');
      }
    } catch (err) {
      console.error('Analytics dashboard error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading analytics.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    fetchData();
  }, [fetchData]);

  return (
    <>
      <AdminHeader userEmail={adminUser?.email} />

      <main className="flex-1 overflow-y-auto bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
          {/* Header & Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                  Live Database Metrics
                </span>
              </div>
              <h1 className="text-3xl font-light tracking-tight text-[var(--color-text-primary)]">
                Overview & Analytics
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Persisted customer enquiry volume, conversion rates, and lifecycle analytics
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
              title="Refresh analytics data"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
              <button
                onClick={fetchData}
                className="text-xs underline font-medium hover:text-red-900 cursor-pointer ml-4"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && !analytics && (
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-[var(--color-border)] rounded p-6 h-32" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[var(--color-border)] rounded p-6 h-80" />
                <div className="bg-white border border-[var(--color-border)] rounded p-6 h-80" />
              </div>
            </div>
          )}

          {/* Real Analytics Content */}
          {analytics && (
            <>
              {/* Executive Overview Metric Cards */}
              <section aria-label="Executive Overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Leads */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Total Leads
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-light text-[var(--color-text-primary)] my-1">
                    {analytics.overview.totalLeads}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Total customer enquiries recorded
                  </p>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Conversion Rate
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-3xl font-light text-[var(--color-text-primary)]">
                      {analytics.overview.conversionRate}%
                    </span>
                    {analytics.overview.convertedLeads > 0 && (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {analytics.overview.convertedLeads} won
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Converted enquiries / total leads
                  </p>
                </div>

                {/* Top Destination Card */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Top Destination
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="my-1">
                    {analytics.overview.topDestination ? (
                      <span className="text-2xl font-light text-[var(--color-text-primary)]">
                        {analytics.overview.topDestination}
                      </span>
                    ) : (
                      <span className="text-sm font-normal text-[var(--color-text-tertiary)] italic">
                        Not enough destination data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {analytics.destinationTrackingAvailable && analytics.topDestinations.length > 0
                      ? `${analytics.topDestinations[0].count} ${analytics.topDestinations[0].count === 1 ? 'enquiry' : 'enquiries'}`
                      : 'No destination-linked enquiries yet'}
                  </p>
                </div>

                {/* Active Destinations */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Active Destinations
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-light text-[var(--color-text-primary)] my-1">
                    {analytics.overview.activeDestinations}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Published itineraries in CMS
                  </p>
                </div>
              </section>

              {/* Core Visualizations Grid */}
              <section aria-label="Visual Analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Monthly Volume Bar Chart */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
                    <div>
                      <h2 className="text-base font-medium text-[var(--color-text-primary)]">
                        Enquiry Activity Over Time
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Monthly customer enquiry volume (rolling 6 months)
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      MongoDB Aggregated
                    </span>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    {mounted && analytics.monthlyVolume.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.monthlyVolume}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis
                            dataKey="label"
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e5e5' }}
                          />
                          <YAxis
                            stroke="#888888"
                            fontSize={11}
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar
                            dataKey="count"
                            fill="#0f4c3a"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={44}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-xs text-[var(--color-text-tertiary)] italic">
                        No enquiry activity recorded in this period
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>Range: 6 consecutive months</span>
                    <span className="font-mono">
                      Sum: {analytics.monthlyVolume.reduce((acc, m) => acc + m.count, 0)} enquiries
                    </span>
                  </div>
                </div>

                {/* 2. Lead Status Breakdown Donut Chart */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-6">
                    <div>
                      <h2 className="text-base font-medium text-[var(--color-text-primary)]">
                        Lead Status Breakdown
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Lifecycle distribution across sales stages
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      Enquiry Lifecycle
                    </span>
                  </div>

                  {analytics.overview.totalLeads > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
                      {/* Donut Chart */}
                      <div className="h-52 w-52 shrink-0">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip content={<CustomPieTooltip />} />
                              <Pie
                                data={analytics.statusBreakdown}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                stroke="none"
                              >
                                {analytics.statusBreakdown.map((entry) => (
                                  <Cell
                                    key={entry.status}
                                    fill={STATUS_COLORS[entry.status] || '#71717a'}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Legend & Stats Table */}
                      <div className="flex-1 w-full space-y-2.5">
                        {analytics.statusBreakdown.map((item) => {
                          const color = STATUS_COLORS[item.status] || '#71717a';
                          return (
                            <div
                              key={item.status}
                              className="flex items-center justify-between text-xs p-2 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-medium text-[var(--color-text-primary)]">
                                  {item.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[var(--color-text-secondary)] font-mono">
                                  {item.count}
                                </span>
                                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] w-12 text-right">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-52 flex flex-col items-center justify-center text-center text-xs text-[var(--color-text-tertiary)] p-6">
                      <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      <span>No enquiries in database yet</span>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>4 lifecycle stages</span>
                    <span className="font-mono">Total: {analytics.overview.totalLeads} leads</span>
                  </div>
                </div>
              </section>

              {/* Secondary Persistence Insights */}
              <section aria-label="Customer Preferences & Destination Analysis" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real Hotel Tier Preferences */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                    <div>
                      <h2 className="text-base font-medium text-[var(--color-text-primary)]">
                        Accommodation Category Preferences
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Real traveler hotel category selections from enquiry submissions
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      Persisted Data
                    </span>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {analytics.hotelCategoryBreakdown && analytics.hotelCategoryBreakdown.length > 0 ? (
                      analytics.hotelCategoryBreakdown.map((item) => (
                        <div key={item.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {item.category}
                            </span>
                            <span className="text-[var(--color-text-secondary)] font-mono">
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--color-text-tertiary)] italic">
                        No accommodation data recorded yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Destination Analytics Card */}
                <div className="bg-white rounded border border-[var(--color-border)] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                    <div>
                      <h2 className="text-base font-medium text-[var(--color-text-primary)]">
                        Top Requested Destinations
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Real persisted destination demand from customer enquiries
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono border px-2 py-0.5 rounded ${
                        analytics.destinationTrackingAvailable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {analytics.destinationTrackingAvailable
                        ? 'Persisted Demand'
                        : 'Schema Audit'}
                    </span>
                  </div>

                  {analytics.destinationTrackingAvailable && analytics.topDestinations.length > 0 ? (
                    <div className="space-y-3.5 pt-2">
                      {analytics.topDestinations.map((item, idx) => (
                        <div key={item.slug || item.destination} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[10px] font-mono flex items-center justify-center text-[var(--color-text-secondary)]">
                                #{idx + 1}
                              </span>
                              {item.destination}
                            </span>
                            <span className="text-[var(--color-text-secondary)] font-mono">
                              {item.count} {item.count === 1 ? 'enquiry' : 'enquiries'}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    (item.count / (analytics.topDestinations[0]?.count || 1)) * 100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                      <p>
                        The enquiry form has been upgraded with destination tracking. Future customer enquiries are linked to destination catalog entries.
                      </p>
                      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 rounded space-y-1.5 font-mono text-[11px]">
                        <div className="text-[var(--color-text-primary)] font-semibold">Tracked Schema Fields:</div>
                        <div>destinationSlug, destinationName, fullName, email, contactNumber, dateOfTravel, numberOfPeople, hotelCategory</div>
                      </div>
                      <p className="text-[var(--color-text-tertiary)] italic">
                        No destination-linked enquiries exist yet in the database. Rankings will populate automatically as new customer enquiries are submitted.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
