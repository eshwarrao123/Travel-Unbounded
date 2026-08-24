import { getInternationalDestinations } from '@/lib/destinations';
import DestinationCard from '@/components/destinations/DestinationCard';

export default function InternationalDestinations() {
  const internationalDestinations = getInternationalDestinations();

  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
      <div className="container-content">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white border border-[var(--color-border)]">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)]">
              Global Journeys
            </span>
          </div>
          <h2 className="heading-section text-[var(--color-text-primary)] mb-4">
            International Destinations
          </h2>
          <p className="body-large text-[var(--color-text-secondary)] max-w-2xl">
            Bespoke global frontiers — from the wild Mara savannahs to emerald dragon bays and volcanic Arctic springs.
          </p>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
