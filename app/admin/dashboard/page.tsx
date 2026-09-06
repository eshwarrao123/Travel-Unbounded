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
  New: '#3b82f6',        // Soft blue
  Contacted: '#d97706',  // Warm amber
  Converted: '#0f4c3a',  // Forest green
  Closed: '#71717a',     // Neutral slate
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
          {item.count} {item.count === 1 ? 'enquiry' : 'enquiries'} ({item.percentage}%)
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
        throw new Error('Failed to retrieve analytics data.');
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

  const totalVolume = analytics?.monthlyVolume.reduce((acc, m) => acc + m.count, 0) || 0;
  const avgMonthly = analytics && analytics.monthlyVolume.length > 0 
    ? (totalVolume / analytics.monthlyVolume.length).toFixed(1) 
    : '0';

  return (
    <>
      <AdminHeader userEmail={adminUser?.email} title="Overview" />

      <main className="flex-1 overflow-y-auto bg-[var(--color-bg-secondary)] admin-scroll">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
          {/* Editorial Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[var(--color-text-primary)] mb-1.5">
                Overview
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal max-w-xl">
                Pipeline activity, lead conversion, and expedition demand across published journeys.
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs font-normal text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] rounded hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--color-accent)]' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchData}
                className="underline font-medium hover:text-red-900 cursor-pointer ml-4"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && !analytics && (
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-[var(--color-border)] rounded p-5 h-28" />
                ))}
              </div>
              <div className="bg-white border border-[var(--color-border)] rounded p-6 h-80" />
            </div>
          )}

          {/* Real Analytics Content */}
          {analytics && (
            <>
              {/* Coherent 4-KPI System */}
              <section aria-label="Key Metrics">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Inbound Leads */}
                  <div className="bg-white rounded border border-[var(--color-border)] p-5.5 hover:border-stone-300 transition-colors">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                      Total Leads
                    </span>
                    <div className="text-3xl font-bold font-mono text-stone-900 mb-1 tracking-tight">
                      {analytics.overview.totalLeads}
                    </div>
                    <p className="text-xs text-stone-500 font-normal">
                      Verified customer enquiries
                    </p>
                  </div>

                  {/* Conversion Rate */}
                  <div className="bg-white rounded border border-[var(--color-border)] p-5.5 hover:border-stone-300 transition-colors">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                      Conversion Rate
                    </span>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold font-mono text-stone-900 tracking-tight">
                        {analytics.overview.conversionRate}%
                      </span>
                      {analytics.overview.convertedLeads > 0 && (
                        <span className="text-xs font-medium text-[var(--color-accent)] font-mono">
                          ({analytics.overview.convertedLeads} won)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-normal">
                      Converted to bookings
                    </p>
                  </div>

                  {/* Top Destination */}
                  <div className="bg-white rounded border border-[var(--color-border)] p-5.5 hover:border-stone-300 transition-colors">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                      Top Destination
                    </span>
                    <div className="text-2xl font-bold font-mono text-stone-900 mb-1 tracking-tight truncate">
                      {analytics.overview.topDestination || (
                        <span className="text-base text-stone-400 italic font-sans font-normal">Awaiting enquiries</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-normal">
                      {analytics.destinationTrackingAvailable && analytics.topDestinations.length > 0
                        ? `${analytics.topDestinations[0].count} requests submitted`
                        : 'Highest customer demand'}
                    </p>
                  </div>

                  {/* Active Destinations */}
                  <div className="bg-white rounded border border-[var(--color-border)] p-5.5 hover:border-stone-300 transition-colors">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                      Active Destinations
                    </span>
                    <div className="text-3xl font-bold font-mono text-stone-900 mb-1 tracking-tight">
                      {analytics.overview.activeDestinations}
                    </div>
                    <p className="text-xs text-stone-500 font-normal">
                      Published journey catalog
                    </p>
                  </div>
                </div>
              </section>

              {/* Primary Analytics Area: ENQUIRY ACTIVITY (Hero Chart) */}
              <section aria-label="Enquiry Activity" className="bg-white rounded border border-[var(--color-border)] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4 mb-6">
                  <div>
                    <h2 className="text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                      Enquiry Activity
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Monthly inbound inquiry volume over the trailing 6 months
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                    Trailing 6 months
                  </span>
                </div>

                <div className="h-72 sm:h-80 w-full flex items-center justify-center">
                  {mounted && analytics.monthlyVolume.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.monthlyVolume}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke="#a3a3a3"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#e5e5e5' }}
                        />
                        <YAxis
                          stroke="#a3a3a3"
                          fontSize={12}
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8faf9' }} />
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
                      No activity recorded in this period
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--color-text-secondary)] gap-2">
                  <span>
                    Average monthly rate: <strong className="text-[var(--color-text-primary)] font-medium">{avgMonthly}</strong> inquiries / month
                  </span>
                  <span className="text-[var(--color-text-tertiary)] font-mono">
                    Total recorded in period: {totalVolume}
                  </span>
                </div>
              </section>

              {/* Secondary Content: Lead Status & Customer Insights */}
              <section aria-label="Secondary Insights" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lead Status (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded border border-[var(--color-border)] p-6 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[var(--color-border)] pb-4 mb-5">
                      <h2 className="text-base font-medium text-[var(--color-text-primary)] tracking-tight">
                        Lead Status
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Inquiries by operational pipeline stage
                      </p>
                    </div>

                    {analytics.overview.totalLeads > 0 ? (
                      <div className="space-y-5">
                        <div className="h-44 w-full flex items-center justify-center">
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
                                  innerRadius={48}
                                  outerRadius={68}
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

                        {/* Status Breakdown List */}
                        <div className="space-y-2">
                          {analytics.statusBreakdown.map((item) => {
                            const color = STATUS_COLORS[item.status] || '#71717a';
                            return (
                              <div
                                key={item.status}
                                className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-[var(--color-bg-secondary)] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="font-normal text-[var(--color-text-primary)]">
                                    {item.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 font-mono">
                                  <span className="text-[var(--color-text-secondary)]">
                                    {item.count}
                                  </span>
                                  <span className="text-[var(--color-text-tertiary)] w-10 text-right">
                                    {item.percentage}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-xs text-[var(--color-text-tertiary)] italic">
                        No enquiries recorded yet
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
                    Active in pipeline: {analytics.overview.totalLeads}
                  </div>
                </div>

                {/* Customer Intelligence: Top Destinations & Accommodation (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Top Requested Destinations */}
                  <div className="bg-white rounded border border-[var(--color-border)] p-6">
                    <div className="border-b border-[var(--color-border)] pb-4 mb-4">
                      <h2 className="text-base font-medium text-[var(--color-text-primary)] tracking-tight">
                        Top Requested Destinations
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Journeys generating the highest inquiry volume
                      </p>
                    </div>

                    {analytics.destinationTrackingAvailable && analytics.topDestinations.length > 0 ? (
                      <div className="space-y-3.5">
                        {analytics.topDestinations.map((item, idx) => {
                          const topCount = analytics.topDestinations[0]?.count || 1;
                          const percentage = Math.min(100, Math.round((item.count / topCount) * 100));

                          return (
                            <div key={item.slug || item.destination} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-normal text-[var(--color-text-primary)] flex items-center gap-2">
                                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
                                    {idx + 1}.
                                  </span>
                                  <span>{item.destination}</span>
                                </span>
                                <span className="text-[var(--color-text-secondary)] font-mono text-xs">
                                  {item.count} {item.count === 1 ? 'enquiry' : 'enquiries'}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--color-text-tertiary)] italic py-4">
                        Rankings calculate dynamically as enquiries are submitted.
                      </p>
                    )}
                  </div>

                  {/* Accommodation Preferences */}
                  <div className="bg-white rounded border border-[var(--color-border)] p-6">
                    <div className="border-b border-[var(--color-border)] pb-4 mb-4">
                      <h2 className="text-base font-medium text-[var(--color-text-primary)] tracking-tight">
                        Accommodation Preferences
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Hotel category requests from incoming enquiries
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {analytics.hotelCategoryBreakdown && analytics.hotelCategoryBreakdown.length > 0 ? (
                        analytics.hotelCategoryBreakdown.map((item) => (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-normal text-[var(--color-text-primary)]">
                                {item.category}
                              </span>
                              <span className="text-[var(--color-text-secondary)] font-mono text-xs">
                                {item.count} ({item.percentage}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#8b5a3c] rounded-full transition-all duration-300"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--color-text-tertiary)] italic py-4">
                          No accommodation preference data recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
