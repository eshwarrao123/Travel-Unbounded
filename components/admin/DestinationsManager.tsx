'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DestinationApiItem,
  DestinationsListResponse,
  DestinationErrorResponse,
} from '@/types/destination';
import DestinationForm from './DestinationForm';

type CategoryFilter = 'all' | 'india' | 'international';

export default function DestinationsManager() {
  const [destinations, setDestinations] = useState<DestinationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>('all');

  // Create / edit form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DestinationApiItem | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DestinationApiItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Broken image tracking (fallback placeholders, no layout shift)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const loadDestinations = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/destinations', { cache: 'no-store' });
      if (res.status === 401) {
        setError('Your session has expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load destinations');
      const data: DestinationsListResponse = await res.json();
      if (data.success) {
        setDestinations(data.data.destinations);
      } else {
        const errData = data as unknown as DestinationErrorResponse;
        throw new Error(errData.error?.message || 'Failed to load destinations');
      }
    } catch (err) {
      console.error('Fetch destinations error:', err);
      setError(err instanceof Error ? err.message : 'Unable to load destinations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    loadDestinations();
  }, [loadDestinations]);

  const handleSaved = (saved: DestinationApiItem, mode: 'create' | 'edit') => {
    setFormOpen(false);
    setEditing(null);
    setDestinations((prev) => {
      if (mode === 'create') return [...prev, saved];
      return prev.map((d) => (d.id === saved.id ? saved : d));
    });
  }; 

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    const target = deleteTarget;
    try {
      const res = await fetch(`/api/destinations/${target.id}`, { method: 'DELETE' });
      if (res.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setDeleteTarget(null);
        return;
      }
      if (res.status === 404) {
        setDestinations((prev) => prev.filter((d) => d.id !== target.id));
        setDeleteTarget(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to delete destination');
      }
      setDestinations((prev) => prev.filter((d) => d.id !== target.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete destination error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete destination');
    } finally {
      setDeleting(false);
    }
  };

  const filtered =
    filter === 'all' ? destinations : destinations.filter((d) => d.category === filter);

  const formatPrice = (price: number) =>
    price > 0 ? `₹${price.toLocaleString('en-IN')}` : '—';

  // ------------------------------------------------------------ loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
          <svg className="animate-spin h-5 w-5 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading destinations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 border border-red-200 bg-red-50 text-red-800 text-sm rounded">
          <span>{error}</span>
          <button
            onClick={() => { setLoading(true); loadDestinations(); }}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-red-300 text-red-700 hover:bg-red-100 transition-colors rounded-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'india', 'international'] as CategoryFilter[]).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-colors cursor-pointer ${
                filter === value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)]'
              }`}
            >
              {value === 'all' ? 'All' : value === 'india' ? 'India' : 'International'}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn btn-primary py-2 px-4 text-sm w-full sm:w-auto cursor-pointer"
        >
          + Add Destination
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {destinations.length === 0
              ? 'No destinations yet. Add your first destination to publish it on the public site.'
              : 'No destinations match this filter.'}
          </p>
          {destinations.length === 0 && (
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="btn btn-primary py-2 px-4 text-sm cursor-pointer"
            >
              + Add Destination
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <div key={d.id} className="group flex flex-col bg-white border border-[var(--color-border)] overflow-hidden">
              {/* Image preview */}
              <div className="relative aspect-[3/2] w-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                {brokenImages[d.id] ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
                    Image unavailable
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [d.id]: true }))}
                  />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-black/60 rounded-sm">
                    {d.category}
                  </span>
                  {d.featured && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-[var(--color-accent)] rounded-sm">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-tight">
                    {d.name}
                  </h3>
                  <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 mt-0.5">
                    {d.country}
                  </span>
                </div>

                <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                  Starting from {formatPrice(d.startingPrice)}
                </p>

                {d.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {d.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-sm text-[var(--color-text-secondary)]"
                      >
                        {tag}
                      </span>
                    ))}
                    {d.tags.length > 4 && (
                      <span className="text-[10px] text-[var(--color-text-tertiary)] self-center">
                        +{d.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 flex-1">
                  {d.shortDescription}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => {
                      setEditing(d);
                      setFormOpen(true);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-sm cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--color-border)] text-red-600 hover:border-red-600 hover:bg-red-50 transition-colors rounded-sm cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Delete destination?
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              This will permanently remove{' '}
              <span className="font-medium text-[var(--color-text-primary)]">{deleteTarget.name}</span>{' '}
              from the public website. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium border border-[var(--color-border)] rounded text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / edit form modal */}
      {formOpen && (
        <DestinationForm
          initial={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
