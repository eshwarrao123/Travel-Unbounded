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

  // Detail view modal
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
    }, 300);

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
          throw new Error('Failed to fetch enquiries.');
        }

        const data = await response.json();

        if (data.success) {
          setEnquiries(data.data.enquiries);
          setTotal(data.data.pagination.total);
          setTotalPages(data.data.pagination.totalPages);
          setPage(data.data.pagination.page);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch enquiries.');
        }
      } catch (err) {
        console.error('Fetch enquiries error:', err);
        setError(err instanceof Error ? err.message : 'Unable to load enquiries.');
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
        setEnquiries((prev) =>
          prev.map((enq) => (enq.id === enquiryId ? data.data : enq))
        );

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

  // Format date nicely
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

  const hasActiveFilters = Boolean(search || statusFilter);

  return (
    <div className="space-y-4">
      {/* Clean CRM Toolbar */}
      <div className="bg-white border border-[var(--color-border)] rounded p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-tertiary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by customer, email, or destination..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:bg-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Dropdown & Clear */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer transition-all font-normal"
          >
            <option value="">All statuses</option>
            {ALLOWED_ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] px-2 py-1 transition-colors whitespace-nowrap font-normal cursor-pointer"
            >
              Clear filters
            </button>
          )}

          <div className="hidden lg:flex items-center text-xs text-[var(--color-text-tertiary)] font-mono pl-3 border-l border-[var(--color-border)] shrink-0">
            <span>{total} {total === 1 ? 'enquiry' : 'enquiries'}</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && enquiries.length === 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded p-6 space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && enquiries.length === 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded p-12 text-center">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            {hasActiveFilters ? 'No enquiries match your search' : 'No enquiries received yet'}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try modifying your search query or status filter.'
              : 'Customer inquiries will appear here as soon as they are submitted on the public website.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Desktop CRM Table */}
      {!loading && enquiries.length > 0 && (
        <div className="hidden md:block bg-white border border-[var(--color-border)] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)]">
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Destination</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Travel Date</th>
                  <th className="py-3 px-5">Party &amp; Hotel</th>
                  <th className="py-3 px-5">Received</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-sm">
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-[#fafaf9] transition-colors group"
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {enquiry.fullName}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] font-normal font-mono">
                        {enquiry.email}
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {enquiry.destinationName || enquiry.destinationSlug || 'Custom Itinerary'}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        {enquiry.phone ? enquiry.phone : 'No phone provided'}
                      </div>
                    </td>

                    {/* Status with inline selector */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <select
                          value={enquiry.status}
                          onChange={(e) =>
                            handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)
                          }
                          disabled={updatingId === enquiry.id}
                          className="text-xs py-1 px-2 border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] font-normal cursor-pointer focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-50 transition-colors"
                        >
                          {ALLOWED_ENQUIRY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {updatingId === enquiry.id && (
                          <span className="w-3 h-3 border border-[var(--color-accent)] border-t-transparent rounded-full animate-spin shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Travel Date */}
                    <td className="py-3.5 px-5 text-xs text-[var(--color-text-secondary)] font-mono">
                      {formatDate(enquiry.travelDate)}
                    </td>

                    {/* Party Size & Hotel */}
                    <td className="py-3.5 px-5">
                      <div className="text-xs font-medium text-[var(--color-text-primary)]">
                        {enquiry.numberOfPeople} {enquiry.numberOfPeople === 1 ? 'Guest' : 'Guests'}
                        {enquiry.numberOfChildren > 0 && (
                          <span className="text-[var(--color-text-tertiary)] font-normal">
                            {' '}(+{enquiry.numberOfChildren} child)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {enquiry.hotelCategory}
                      </div>
                    </td>

                    {/* Received Date */}
                    <td className="py-3.5 px-5 text-xs text-[var(--color-text-tertiary)] font-mono">
                      {formatDate(enquiry.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="text-xs font-normal text-[var(--color-accent)] hover:underline cursor-pointer"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Strip */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] bg-[#fafaf9] text-xs text-[var(--color-text-secondary)]">
            <span>
              Showing <strong className="text-[var(--color-text-primary)] font-medium">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="text-[var(--color-text-primary)] font-medium">{Math.min(page * limit, total)}</strong> of{' '}
              <strong className="text-[var(--color-text-primary)] font-medium">{total}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-2.5 py-1 border border-[var(--color-border)] rounded bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                &larr; Prev
              </button>
              <span className="text-[var(--color-text-tertiary)] font-mono px-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-2.5 py-1 border border-[var(--color-border)] rounded bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card CRM Layout (< md) */}
      {!loading && enquiries.length > 0 && (
        <div className="md:hidden space-y-3">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white border border-[var(--color-border)] rounded p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                    {enquiry.fullName}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                    {enquiry.email}
                  </p>
                </div>
                <StatusBadge status={enquiry.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[var(--color-border)]">
                <div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                    Destination
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)] truncate block">
                    {enquiry.destinationName || enquiry.destinationSlug || 'Custom'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                    Travel Date
                  </span>
                  <span className="text-[var(--color-text-secondary)] font-mono">
                    {formatDate(enquiry.travelDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                    Party Size
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {enquiry.numberOfPeople} Guests
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                    Hotel
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {enquiry.hotelCategory}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <select
                  value={enquiry.status}
                  onChange={(e) =>
                    handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)
                  }
                  disabled={updatingId === enquiry.id}
                  className="text-xs py-1.5 px-2.5 border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] font-normal flex-1 cursor-pointer"
                >
                  {ALLOWED_ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSelectedEnquiry(enquiry)}
                  className="px-3 py-1.5 text-xs font-normal text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between p-3 bg-white border border-[var(--color-border)] rounded text-xs text-[var(--color-text-secondary)]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-[var(--color-border)] rounded disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-[var(--color-border)] rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structured Detail Modal Panel */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="bg-white rounded border border-[var(--color-border)] max-w-lg w-full my-8 overflow-hidden shadow-xl transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-enquiry-title"
          >
            {/* Modal Header */}
            <div className="bg-[#fafaf9] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 id="modal-enquiry-title" className="text-base font-medium text-[var(--color-text-primary)]">
                  {selectedEnquiry.fullName}
                </h2>
                <StatusBadge status={selectedEnquiry.status} size="sm" />
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto admin-scroll text-sm">
              {/* Customer Contact */}
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Client Contact
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border)]">
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">Email</span>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="font-mono text-xs text-[var(--color-accent)] hover:underline font-normal break-all"
                    >
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">Phone</span>
                    <span className="font-mono text-xs text-[var(--color-text-primary)]">
                      {selectedEnquiry.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Journey Specifications */}
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Journey Specifications
                </p>
                <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border)]">
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">Destination</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {selectedEnquiry.destinationName || selectedEnquiry.destinationSlug || 'Custom Itinerary'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">Departure Date</span>
                    <span className="font-mono text-[var(--color-text-primary)]">
                      {formatDate(selectedEnquiry.travelDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">Party</span>
                    <span className="text-[var(--color-text-primary)]">
                      {selectedEnquiry.numberOfPeople} {selectedEnquiry.numberOfPeople === 1 ? 'Adult' : 'Adults'}
                      {selectedEnquiry.numberOfChildren > 0 && ` + ${selectedEnquiry.numberOfChildren} Children`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">Hotel Tier</span>
                    <span className="text-[var(--color-text-primary)]">
                      {selectedEnquiry.hotelCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Update Lifecycle Status
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) =>
                      handleStatusChange(selectedEnquiry.id, e.target.value as EnquiryStatus)
                    }
                    disabled={updatingId === selectedEnquiry.id}
                    className="text-xs py-2 px-3 border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] font-normal cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    {ALLOWED_ENQUIRY_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingId === selectedEnquiry.id && (
                    <span className="text-xs text-[var(--color-text-tertiary)]">Updating...</span>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)] font-mono">
                <span>Received: {formatDate(selectedEnquiry.createdAt)}</span>
                {selectedEnquiry.updatedAt && (
                  <span>Updated: {formatDate(selectedEnquiry.updatedAt)}</span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#fafaf9] border-t border-[var(--color-border)] px-6 py-3.5 flex items-center justify-between">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Your Travel Unbounded Journey Inquiry`}
                className="inline-flex items-center gap-2 text-xs font-normal text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-3.5 py-2 rounded transition-colors active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email Client</span>
              </a>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-3.5 py-2 text-xs font-normal border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
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
