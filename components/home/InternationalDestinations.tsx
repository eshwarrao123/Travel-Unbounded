import { getInternationalDestinations } from '@/lib/destinations';
import DestinationCard from '@/components/destinations/DestinationCard';
import Link from 'next/link';

export default function InternationalDestinations() {
  const internationalDestinations = getInternationalDestinations();

  return (
    <section className="py-14 md:py-20 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
      <div className="container-content">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-white border border-[var(--color-border)]">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)]">
                Global Journeys
              </span>
            </div>
            <h2 className="heading-section text-[var(--color-text-primary)]">
              International Destinations
            </h2>
          </div>
          <Link
            href="/destinations"
            className="text-sm font-medium text-[var(--color-accent)] hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {internationalDestinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
