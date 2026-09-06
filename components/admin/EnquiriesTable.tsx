'use client';

import { useState, useEffect } from 'react';
import {
  AdminEnquiryItem,
  EnquiryStatus,
  ALLOWED_ENQUIRY_STATUSES,
} from '@/types/enquiry';
import StatusBadge from './StatusBadge';

interface EnquiriesTableProps {
  initialData?: AdminEnquiryItem[];
  initialPage?: number;
  initialTotal?: number;
  initialTotalPages?: number;
}

export default function EnquiriesTable({
  initialData = [],
  initialPage = 1,
  initialTotal = 0,
  initialTotalPages = 1,
}: EnquiriesTableProps) {
  const [enquiries, setEnquiries] = useState<AdminEnquiryItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | ''>('');
  
  // Pagination
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const limit = 20;

  // Detail view
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminEnquiryItem | null>(null);

  // Updating status
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1); // Reset to first page on search
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  // Fetch enquiries when filters/page change
  useEffect(() => {
    async function fetchEnquiries() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) {
          params.set('search', search);
        }

        if (statusFilter) {
          params.set('status', statusFilter);
        }

        const response = await fetch(`/api/enquiry?${params.toString()}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Your session has expired. Please sign in again.');
            return;
          }
          throw new Error('Failed to fetch enquiries');
        }

        const data = await response.json();

        if (data.success) {
          setEnquiries(data.data.enquiries);
          setTotal(data.data.pagination.total);
          setTotalPages(data.data.pagination.totalPages);
          setPage(data.data.pagination.page);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch enquiries');
        }
      } catch (err) {
        console.error('Fetch enquiries error:', err);
        setError(err instanceof Error ? err.message : 'Unable to load enquiries');
      } finally {
        setLoading(false);
      }
    }

    fetchEnquiries();
  }, [page, search, statusFilter, limit]);

  // Update enquiry status
  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus) => {
    setUpdatingId(enquiryId);
    setError(null);

    try {
      const response = await fetch(`/api/enquiry/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again.');
          return;
        }
        throw new Error('Failed to update status');
      }

      const data = await response.json();

      if (data.success) {
        // Update the enquiry in the list
        setEnquiries((prev) =>
          prev.map((enq) =>
            enq.id === enquiryId ? data.data : enq
          )
        );

        // Update selected enquiry if it's the one being updated
        if (selectedEnquiry?.id === enquiryId) {
          setSelectedEnquiry(data.data);
        }
      } else {
        throw new Error(data.error?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError(err instanceof Error ? err.message : 'Unable to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as EnquiryStatus | '');
    setPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return '—';
    }
  };

  const hasActiveFilters = search || statusFilter;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ALLOWED_ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && enquiries.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-50 animate-pulse rounded" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && enquiries.length === 0 && (
        <div className="text-center py-12 px-4">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-1">
            {hasActiveFilters ? 'No enquiries match these filters' : 'No enquiries yet'}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {hasActiveFilters
              ? 'Try adjusting your search or filter criteria'
              : 'Customer enquiries will appear here when submitted'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Desktop table */}
      {!loading && enquiries.length > 0 && (
        <>
          <div className="hidden lg:block overflow-x-auto border border-[var(--color-border)] rounded">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Travel Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    People
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Hotel
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] uppercase tracking-wider text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--color-border)]">
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--color-text-primary)] font-medium">
                      {enquiry.fullName}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {enquiry.destinationName || enquiry.destinationSlug || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {enquiry.email}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] text-xs">
                      {enquiry.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {formatDate(enquiry.travelDate)}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {enquiry.numberOfPeople}
                      {enquiry.numberOfChildren > 0 && (
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {' '}
                          (+{enquiry.numberOfChildren} child
                          {enquiry.numberOfChildren !== 1 ? 'ren' : ''})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {enquiry.hotelCategory}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={enquiry.status}
                        onChange={(e) =>
                          handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)
                        }
                        disabled={updatingId === enquiry.id}
                        className="text-xs px-2 py-1 border border-[var(--color-border)] rounded bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ALLOWED_ENQUIRY_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] text-xs">
                      {formatDate(enquiry.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="text-xs text-[var(--color-accent)] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet card view */}
          <div className="lg:hidden space-y-3">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white border border-[var(--color-border)] rounded p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                      {enquiry.fullName}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">
                      {enquiry.email}
                    </p>
                  </div>
                  <StatusBadge status={enquiry.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Destination
                    </span>
                    <p className="text-[var(--color-text-primary)] truncate">
                      {enquiry.destinationName || enquiry.destinationSlug || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Travel Date
                    </span>
                    <p className="text-[var(--color-text-primary)]">
                      {formatDate(enquiry.travelDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      People
                    </span>
                    <p className="text-[var(--color-text-primary)]">
                      {enquiry.numberOfPeople}
                      {enquiry.numberOfChildren > 0 &&
                        ` (+${enquiry.numberOfChildren})`}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Hotel
                    </span>
                    <p className="text-[var(--color-text-primary)]">
                      {enquiry.hotelCategory}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Created
                    </span>
                    <p className="text-[var(--color-text-primary)]">
                      {formatDate(enquiry.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                  <select
                    value={enquiry.status}
                    onChange={(e) =>
                      handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)
                    }
                    disabled={updatingId === enquiry.id}
                    className="flex-1 text-sm px-3 py-1.5 border border-[var(--color-border)] rounded bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ALLOWED_ENQUIRY_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="px-4 py-1.5 text-sm text-[var(--color-accent)] border border-[var(--color-accent)] rounded hover:bg-[var(--color-accent-light)] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && enquiries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">
            Showing <span className="font-medium text-[var(--color-text-primary)]">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-medium text-[var(--color-text-primary)]">
              {Math.min(page * limit, total)}
            </span>{' '}
            of <span className="font-medium text-[var(--color-text-primary)]">{total}</span> enquiries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <span className="text-sm text-[var(--color-text-secondary)] px-2">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Enquiry Details
              </h3>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Customer Name
                </label>
                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                  {selectedEnquiry.fullName}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Email Address
                </label>
                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    {selectedEnquiry.email}
                  </a>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Phone Number
                </label>
                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                  {selectedEnquiry.phone || '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Travel Date
                  </label>
                  <p className="text-sm text-[var(--color-text-primary)] mt-1">
                    {formatDate(selectedEnquiry.travelDate)}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Number of People
                  </label>
                  <p className="text-sm text-[var(--color-text-primary)] mt-1">
                    {selectedEnquiry.numberOfPeople}
                  </p>
                </div>
              </div>

              {selectedEnquiry.numberOfChildren > 0 && (
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Children
                  </label>
                  <p className="text-sm text-[var(--color-text-primary)] mt-1">
                    {selectedEnquiry.numberOfChildren}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Hotel Category
                </label>
                <p className="text-sm text-[var(--color-text-primary)] mt-1">
                  {selectedEnquiry.hotelCategory}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Destination
                </label>
                <p className="text-sm text-[var(--color-text-primary)] mt-1 font-medium">
                  {selectedEnquiry.destinationName || selectedEnquiry.destinationSlug || '—'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Status
                </label>
                <div className="mt-2">
                  <StatusBadge status={selectedEnquiry.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Created
                  </label>
                  <p className="text-sm text-[var(--color-text-primary)] mt-1">
                    {formatDate(selectedEnquiry.createdAt)}
                  </p>
                </div>

                {selectedEnquiry.updatedAt && (
                  <div>
                    <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Last Updated
                    </label>
                    <p className="text-sm text-[var(--color-text-primary)] mt-1">
                      {formatDate(selectedEnquiry.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] px-6 py-4">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="w-full px-4 py-2 text-sm font-medium bg-white border border-[var(--color-border)] rounded text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
