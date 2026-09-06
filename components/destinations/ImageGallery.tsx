'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';

interface ImageGalleryProps {
  images: string[];
  destinationName: string;
}

export default function ImageGallery({ images, destinationName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === selectedIndex) return;
      setSelectedIndex(index);
      setFadeKey((k) => k + 1);
    },
    [selectedIndex]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(index);
      }
    },
    [handleSelect]
  );

  // Prev / Next controls for the main image
  const goPrev = useCallback(() => {
    handleSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  }, [selectedIndex, images.length, handleSelect]);

  const goNext = useCallback(() => {
    handleSelect(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  }, [selectedIndex, images.length, handleSelect]);

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      {/* Main Image with crossfade + navigation arrows */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-tertiary)] group">
        <Image
          key={fadeKey}
          src={images[selectedIndex]}
          alt={`${destinationName} — gallery image ${selectedIndex + 1} of ${images.length}`}
          fill
          className="object-cover animate-gallery-fade"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-sm pointer-events-none">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Arrow controls — only rendered when multiple images exist */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/65 text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/65 text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative aspect-square overflow-hidden rounded-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 ${
                selectedIndex === index
                  ? 'ring-2 ring-[var(--color-accent)] ring-offset-1'
                  : 'opacity-55 hover:opacity-90'
              }`}
              aria-label={`View gallery image ${index + 1}`}
              aria-pressed={selectedIndex === index}
            >
              <Image
                src={image}
                alt={`${destinationName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
