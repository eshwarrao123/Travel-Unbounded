import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean;
}

export default function DestinationCard({ destination, priority = false }: DestinationCardProps) {
  const formattedPrice = destination.startingPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(destination.startingPrice)
    : null;

  return (
    <div className="group flex flex-col overflow-hidden bg-white border border-[var(--color-border)] rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={destination.heroImage}
          alt={`${destination.name} - ${destination.shortDescription}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
        
        {/* Country Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md rounded-full border border-white/20">
            {destination.country}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="heading-subsection text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
          {destination.name}
        </h3>
        
        <p className="body-small text-[var(--color-text-secondary)] line-clamp-2 mb-6 flex-1">
          {destination.shortDescription}
        </p>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <div>
            <span className="text-[11px] text-[var(--color-text-tertiary)] block uppercase tracking-wider font-medium">
              Starting from
            </span>
            <span className="text-lg font-semibold text-[var(--color-text-primary)]">
              {formattedPrice || 'On Request'}
            </span>
          </div>

          <Link
            href={`/destinations/${destination.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--color-text-primary)] hover:bg-[var(--color-accent)] transition-colors rounded-md group/btn"
          >
            <span>View Details</span>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
