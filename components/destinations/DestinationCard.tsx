import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean;
}

export default function DestinationCard({ destination, priority = false }: DestinationCardProps) {
  const formattedPrice = destination.startingPrice
    ? `₹${destination.startingPrice.toLocaleString('en-IN')}`
    : null;

  return (
    <div className="group flex flex-col overflow-hidden bg-white border border-[var(--color-border)] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image Container */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100">
        <Image
          src={destination.heroImage}
          alt={`${destination.name} — ${destination.shortDescription}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Country Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded-sm">
            {destination.country}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1.5 group-hover:text-[var(--color-accent)] transition-colors leading-tight">
          {destination.name}
        </h3>

        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 flex-1 leading-relaxed">
          {destination.shortDescription}
        </p>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          {formattedPrice && (
            <div>
              <span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-0.5">
                Starting from
              </span>
              <span className="text-base font-semibold text-[var(--color-text-primary)]">
                {formattedPrice}
              </span>
            </div>
          )}

          <Link
            href={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors rounded-sm"
          >
            View Details
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
