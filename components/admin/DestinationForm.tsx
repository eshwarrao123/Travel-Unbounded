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
  'w-full px-3 py-2 text-xs sm:text-sm border border-[var(--color-border)] rounded bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed';

const labelClass =
  'block text-xs font-medium text-[var(--color-text-primary)] mb-1.5';

const sectionHeaderClass =
  'text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--color-border)] flex items-center gap-2';

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

    const clientErrors: Record<string, string> = {};
    if (!name.trim()) clientErrors.name = 'Destination name is required.';
    if (!heroImage.trim()) clientErrors.imageUrl = 'Hero image URL is required.';
    else if (!/^https?:\/\/\S+$/i.test(heroImage.trim())) clientErrors.imageUrl = 'Must be a valid http(s) image URL.';
    if (!description.trim()) clientErrors.description = 'Description is required.';
    if (price.trim() !== '' && (Number.isNaN(Number(price)) || Number(price) < 0)) {
      clientErrors.price = 'Starting price must be a non-negative number.';
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Please resolve the highlighted fields before saving.');
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
        setFormError('Your administrative session has expired. Please sign in again.');
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
      setFormError('Failed to save destination. Please verify network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-[var(--color-border)] rounded shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#fafaf9] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-medium text-[var(--color-text-primary)]">
              {isEdit ? 'Edit Destination' : 'Add Destination'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Configure details, photography, and pricing for the published catalog
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="destination-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scroll p-6 space-y-8">
          {/* General Form Error Alert */}
          {formError && (
            <div className="p-3 text-xs leading-relaxed text-red-800 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className={sectionHeaderClass}>
              <span>01</span>
              <span>Basic Information</span>
            </h3>

            <div>
              <label htmlFor="dest-name" className={labelClass}>
                Destination Title <span className="text-red-500">*</span>
              </label>
              <input
                id="dest-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                placeholder="e.g. Masai Mara Safari Reserve"
                disabled={submitting}
              />
              {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="dest-slug" className={labelClass}>URL Slug</label>
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
                <label htmlFor="dest-category" className={labelClass}>
                  Category <span className="text-red-500">*</span>
                </label>
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
              </div>
            </div>

            <div>
              <label htmlFor="dest-country" className={labelClass}>Country</label>
              <input
                id="dest-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
                placeholder="e.g. Kenya"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Section 2: Trip Details */}
          <div className="space-y-4">
            <h3 className={sectionHeaderClass}>
              <span>02</span>
              <span>Trip Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="dest-duration" className={labelClass}>Duration</label>
                <input
                  id="dest-duration"
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 7 Days / 6 Nights"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="dest-price" className={labelClass}>Starting Price (INR)</label>
                <input
                  id="dest-price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 85000"
                  disabled={submitting}
                />
                {fieldErrors.price && <p className="text-xs text-red-600 mt-1">{fieldErrors.price}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Media & Photography */}
          <div className="space-y-4">
            <h3 className={sectionHeaderClass}>
              <span>03</span>
              <span>Media &amp; Photography</span>
            </h3>

            {/* Hero Image */}
            <div>
              <label htmlFor="dest-image" className={labelClass}>
                Hero Image URL <span className="text-red-500">*</span>
              </label>
              <input
                id="dest-image"
                type="url"
                value={heroImage}
                onChange={(e) => {
                  setHeroImage(e.target.value);
                  setImageFailed(false);
                }}
                className={inputClass}
                placeholder="https://images.unsplash.com/..."
                disabled={submitting}
              />
              {fieldErrors.imageUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.imageUrl}</p>}

              {/* Hero Preview */}
              <div className="mt-3">
                <div className="relative aspect-[16/9] w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded overflow-hidden">
                  {heroImage.trim() === '' ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
                      Hero photograph preview appears here
                    </div>
                  ) : imageFailed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-red-600 bg-red-50">
                      <span>Unable to load image from specified URL</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroImage.trim()}
                      alt="Hero preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setImageFailed(true)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Gallery Photography</label>
                <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                  {galleryImages.length} {galleryImages.length === 1 ? 'image' : 'images'}
                </span>
              </div>

              <div className="space-y-2">
                {galleryImages.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const updated = [...galleryImages];
                          updated[index] = e.target.value;
                          setGalleryImages(updated);
                          setGalleryImageErrors((prev) => ({ ...prev, [index]: false }));
                        }}
                        className={inputClass}
                        placeholder="https://images.unsplash.com/..."
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
                      className="px-3 py-1.5 text-xs font-normal text-stone-500 hover:text-red-600 border border-[var(--color-border)] rounded transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setGalleryImages([...galleryImages, ''])}
                  disabled={submitting}
                  className="w-full py-2 px-3 text-xs font-normal border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] rounded transition-colors cursor-pointer"
                >
                  + Add another gallery photo
                </button>
              </div>

              {/* Gallery Previews Grid */}
              {galleryImages.some((url) => url.trim() !== '') && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {galleryImages.map((url, index) => (
                    url.trim() !== '' && (
                      <div key={index} className="relative aspect-[4/3] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded overflow-hidden">
                        {galleryImageErrors[index] ? (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-600 p-1 text-center bg-red-50">
                            Failed to load
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url.trim()}
                            alt={`Gallery ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => setGalleryImageErrors((prev) => ({ ...prev, [index]: true }))}
                          />
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Content & Editorial */}
          <div className="space-y-4">
            <h3 className={sectionHeaderClass}>
              <span>04</span>
              <span>Content</span>
            </h3>

            <div>
              <label htmlFor="dest-short" className={labelClass}>Card Summary (Teaser)</label>
              <input
                id="dest-short"
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={inputClass}
                placeholder="Concise overview featured on destination catalog cards (max 140 chars)"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="dest-desc" className={labelClass}>
                Detailed Overview &amp; Itinerary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="dest-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                placeholder="Complete editorial description displayed on the destination detail page..."
                disabled={submitting}
              />
              {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
            </div>

            <div>
              <label htmlFor="dest-tags" className={labelClass}>Tags / Highlights</label>
              <input
                id="dest-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
                placeholder="Comma separated: Big Cats, Safari, Photography, UNESCO"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Section 5: Publishing Settings */}
          <div className="space-y-4">
            <h3 className={sectionHeaderClass}>
              <span>05</span>
              <span>Publishing</span>
            </h3>

            <div className="p-3.5 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border)]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[var(--color-accent)] cursor-pointer"
                  disabled={submitting}
                />
                <div>
                  <span className="text-xs font-medium text-[var(--color-text-primary)] block">
                    Feature on Homepage Spotlight
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Prominently highlight this journey in the curated expedition showcase.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-[#fafaf9] border-t border-[var(--color-border)] px-6 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-1.5 text-xs font-normal border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="destination-edit-form"
            disabled={submitting}
            className="px-4 py-1.5 text-xs font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded transition-colors disabled:opacity-60 cursor-pointer active:scale-[0.98]"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Destination'}
          </button>
        </div>
      </div>
    </div>
  );
}
