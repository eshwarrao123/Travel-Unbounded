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

  // Broken image tracking
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
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
    price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Price on request';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <svg className="animate-spin h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 border border-red-200 bg-red-50 text-red-800 text-xs rounded">
          <span>{error}</span>
          <button
            onClick={() => { setLoading(true); loadDestinations(); }}
            className="shrink-0 text-xs underline font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Editorial Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-[var(--color-border)] rounded p-3">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1">
          {(['all', 'india', 'international'] as CategoryFilter[]).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 text-xs font-normal rounded transition-colors cursor-pointer ${
                filter === value
                  ? 'bg-[var(--color-bg-secondary)] text-[var(--color-accent)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {value === 'all' ? 'All Expeditions' : value === 'india' ? 'India' : 'International'}
            </button>
          ))}
        </div>

        {/* Counter & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
            {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}
          </span>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-normal text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded transition-colors cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add destination</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-[var(--color-border)] rounded p-12 text-center">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            {destinations.length === 0
              ? 'Catalog is empty'
              : 'No destinations match this filter'}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4 max-w-sm mx-auto">
            {destinations.length === 0
              ? 'Publish your first journey to feature it on the public website.'
              : 'Switch category tabs to view other published destinations.'}
          </p>
          {destinations.length === 0 && (
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="text-xs font-medium text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              + Create first destination
            </button>
          )}
        </div>
      ) : (
        /* Image-Led Destination Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="group flex flex-col bg-white border border-[var(--color-border)] rounded overflow-hidden hover:border-[var(--color-border-strong)] transition-colors"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/10] w-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                {brokenImages[d.id] ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
                    Photograph unavailable
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [d.id]: true }))}
                  />
                )}

                {/* Subtle Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 text-[10px] font-normal uppercase tracking-wider text-white bg-black/60 backdrop-blur-xs rounded">
                    {d.category}
                  </span>
                  {d.featured && (
                    <span className="px-2 py-0.5 text-[10px] font-normal uppercase tracking-wider text-emerald-100 bg-emerald-900/80 backdrop-blur-xs rounded">
                      Featured
                    </span>
                  )}
                </div>

                {d.galleryImages && d.galleryImages.length > 0 && (
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="px-2 py-0.5 text-[10px] font-mono text-white/90 bg-black/60 backdrop-blur-xs rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{d.galleryImages.length + 1}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h2 className="text-base font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                    {d.name}
                  </h2>
                  <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider shrink-0">
                    {d.country}
                  </span>
                </div>

                <div className="text-xs font-medium text-[var(--color-accent)] mb-2.5">
                  Starting from {formatPrice(d.startingPrice)}
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mb-4 flex-1">
                  {d.shortDescription || d.description}
                </p>

                {/* Secondary Tags / Highlights */}
                {d.tags && d.tags.length > 0 && (
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mb-4 truncate">
                    {d.tags.join(' · ')}
                  </p>
                )}

                {/* Understated Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-auto text-xs">
                  <button
                    onClick={() => {
                      setEditing(d);
                      setFormOpen(true);
                    }}
                    className="font-normal text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                  >
                    Edit journey
                  </button>
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="font-normal text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded shadow-xl p-6">
            <h2 className="text-base font-medium text-[var(--color-text-primary)] mb-2">
              Delete Destination
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[var(--color-text-primary)]">{deleteTarget.name}</strong>?{' '}
              This will remove the destination from the published catalog and cannot be undone.
            </p>
            <div className="flex justify-end gap-3 text-xs">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-3.5 py-1.5 border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3.5 py-1.5 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 rounded transition-colors cursor-pointer active:scale-[0.98]"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
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
