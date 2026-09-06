'use client';

import { useState } from 'react';
import {
  ALLOWED_DESTINATION_CATEGORIES,
  ALLOWED_DESTINATION_REGIONS,
  DestinationApiItem,
  DestinationErrorResponse,
  DestinationMutationResponse,
} from '@/types/destination';
import { slugify } from '@/lib/validations/destination';

interface DestinationFormProps {
  /** null = create mode, otherwise edit mode */
  initial: DestinationApiItem | null;
  onClose: () => void;
  onSaved: (item: DestinationApiItem, mode: 'create' | 'edit') => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)] transition-colors';

const labelClass =
  'block text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5';

export default function DestinationForm({ initial, onClose, onSaved }: DestinationFormProps) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [country, setCountry] = useState(initial?.country ?? '');
  const [category, setCategory] = useState<'india' | 'international'>(initial?.category ?? 'india');
  const [region, setRegion] = useState(initial?.region ?? 'Asia');
  const [price, setPrice] = useState(initial && initial.startingPrice > 0 ? String(initial.startingPrice) : '');
  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? '');
  const [galleryImages, setGalleryImages] = useState<string[]>(initial?.galleryImages ?? []);
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [duration, setDuration] = useState(initial?.duration ?? '');
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFailed, setImageFailed] = useState(false);
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Minimal client-side checks — the server re-validates everything.
    const clientErrors: Record<string, string> = {};
    if (!name.trim()) clientErrors.name = 'Name is required.';
    if (!heroImage.trim()) clientErrors.imageUrl = 'Image URL is required.';
    else if (!/^https?:\/\/\S+$/i.test(heroImage.trim())) clientErrors.imageUrl = 'Image URL must be a valid http(s) URL.';
    if (!description.trim()) clientErrors.description = 'Description is required.';
    if (price.trim() !== '' && (Number.isNaN(Number(price)) || Number(price) < 0)) {
      clientErrors.price = 'Price must be a non-negative number.';
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        slug: (slug || slugify(name)).trim().toLowerCase(),
        country: country.trim() || name.trim(),
        category,
        region,
        price: price.trim() === '' ? 0 : Number(price),
        heroImage: heroImage.trim(),
        galleryImages: galleryImages
          .map((url) => url.trim())
          .filter((url) => url !== '' && /^https?:\/\/\S+$/i.test(url)),
        shortDescription: shortDescription.trim() || description.trim().slice(0, 140),
        description: description.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        duration: duration.trim(),
        featured,
      };

      const res = await fetch(
        isEdit ? `/api/destinations/${initial!.id}` : '/api/destinations',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (res.status === 401) {
        setFormError('Your session has expired. Please sign in again.');
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errData = data as DestinationErrorResponse;
        setFormError(errData.error?.message || 'Failed to save destination.');
        if (errData.error?.details) setFieldErrors(errData.error.details);
        return;
      }

      const saved = (data as DestinationMutationResponse).data;
      onSaved(saved, isEdit ? 'edit' : 'create');
    } catch (err) {
      console.error('Save destination error:', err);
      setFormError('Failed to save destination. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[var(--color-border)] rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            {isEdit ? 'Edit Destination' : 'Add Destination'}
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General error */}
          {formError && (
            <div className="p-3 text-xs leading-relaxed text-red-800 bg-red-50 border border-red-200 rounded">
              {formError}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="dest-name" className={labelClass}>Name *</label>
            <input
              id="dest-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputClass}
              placeholder="e.g. Kerala Backwaters"
              disabled={submitting}
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Slug / Category / Region */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dest-slug" className={labelClass}>Slug</label>
              <input
                id="dest-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                className={inputClass}
                placeholder="auto-generated"
                disabled={submitting || isEdit}
              />
              {fieldErrors.slug && <p className="text-xs text-red-600 mt-1">{fieldErrors.slug}</p>}
            </div>
            <div>
              <label htmlFor="dest-category" className={labelClass}>Category *</label>
              <select
                id="dest-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'india' | 'international')}
                className={inputClass}
                disabled={submitting}
              >
                {ALLOWED_DESTINATION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === 'india' ? 'India' : 'International'}</option>
                ))}
              </select>
              {fieldErrors.category && <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>}
            </div>
            <div>
              <label htmlFor="dest-region" className={labelClass}>Region</label>
              <select
                id="dest-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={inputClass}
                disabled={submitting}
              >
                {ALLOWED_DESTINATION_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {fieldErrors.region && <p className="text-xs text-red-600 mt-1">{fieldErrors.region}</p>}
            </div>
          </div>

          {/* Country / Duration / Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dest-country" className={labelClass}>Country</label>
              <input id="dest-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} placeholder="e.g. India" disabled={submitting} />
              {fieldErrors.country && <p className="text-xs text-red-600 mt-1">{fieldErrors.country}</p>}
            </div>
            <div>
              <label htmlFor="dest-duration" className={labelClass}>Duration</label>
              <input id="dest-duration" type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} placeholder="e.g. 6-8 days" disabled={submitting} />
              {fieldErrors.duration && <p className="text-xs text-red-600 mt-1">{fieldErrors.duration}</p>}
            </div>
            <div>
              <label htmlFor="dest-price" className={labelClass}>Price (INR)</label>
              <input id="dest-price" type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="e.g. 25000" disabled={submitting} />
              {fieldErrors.price && <p className="text-xs text-red-600 mt-1">{fieldErrors.price}</p>}
            </div>
          </div>

          {/* Hero Image URL + preview */}
          <div>
            <label htmlFor="dest-image" className={labelClass}>Hero Image *</label>
            <input
              id="dest-image"
              type="url"
              value={heroImage}
              onChange={(e) => {
                setHeroImage(e.target.value);
                setImageFailed(false);
              }}
              className={inputClass}
              placeholder="https://..."
              disabled={submitting}
            />
            {fieldErrors.imageUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.imageUrl}</p>}
            <div className="mt-3">
              <div className="relative aspect-video w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded overflow-hidden">
                {heroImage.trim() === '' ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
                    Image preview appears here
                  </div>
                ) : imageFailed ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-red-600">
                    <span>Image failed to load</span>
                    <span className="text-[var(--color-text-tertiary)]">Check the URL and try again</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage.trim()}
                    alt="Destination preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setImageFailed(true)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <label className={labelClass}>Gallery Images</label>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
              Add multiple images to showcase this destination (optional)
            </p>
            
            <div className="space-y-3">
              {galleryImages.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newGallery = [...galleryImages];
                        newGallery[index] = e.target.value;
                        setGalleryImages(newGallery);
                        setGalleryImageErrors((prev) => ({ ...prev, [index]: false }));
                      }}
                      className={inputClass}
                      placeholder="https://..."
                      disabled={submitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryImages(galleryImages.filter((_, i) => i !== index));
                      setGalleryImageErrors((prev) => {
                        const updated = { ...prev };
                        delete updated[index];
                        return updated;
                      });
                    }}
                    disabled={submitting}
                    className="px-3 py-2 text-xs font-medium border border-[var(--color-border)] text-red-600 hover:border-red-600 hover:bg-red-50 transition-colors rounded disabled:opacity-50 cursor-pointer"
                    aria-label="Remove image"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => setGalleryImages([...galleryImages, ''])}
                disabled={submitting}
                className="w-full px-3 py-2 text-xs font-medium border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded disabled:opacity-50 cursor-pointer"
              >
                + Add Gallery Image
              </button>
            </div>
            
            {/* Gallery Previews */}
            {galleryImages.some((url) => url.trim() !== '') && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {galleryImages.map((url, index) => (
                  url.trim() !== '' && (
                    <div key={index} className="relative aspect-video bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded overflow-hidden">
                      {galleryImageErrors[index] ? (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-600 p-1 text-center">
                          Failed to load
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url.trim()}
                          alt={`Gallery preview ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={() => setGalleryImageErrors((prev) => ({ ...prev, [index]: true }))}
                        />
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
            
            {fieldErrors.galleryImages && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.galleryImages}</p>
            )}
          </div>

          {/* Short description */}
          <div>
            <label htmlFor="dest-short" className={labelClass}>Short Description</label>
            <input id="dest-short" type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} placeholder="Shown on destination cards (auto-derived from description if empty)" disabled={submitting} />
            {fieldErrors.shortDescription && <p className="text-xs text-red-600 mt-1">{fieldErrors.shortDescription}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="dest-desc" className={labelClass}>Description *</label>
            <textarea id="dest-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Full destination description shown on the detail page" disabled={submitting} />
            {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="dest-tags" className={labelClass}>Tags</label>
            <input id="dest-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="Comma separated, e.g. Nature, Culture" disabled={submitting} />
            {fieldErrors.tags && <p className="text-xs text-red-600 mt-1">{fieldErrors.tags}</p>}
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-[var(--color-accent)]" disabled={submitting} />
            <span className="text-sm text-[var(--color-text-secondary)]">Feature this destination on the public site</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium border border-[var(--color-border)] rounded text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60 rounded cursor-pointer"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
