import { Metadata } from 'next';
import { getAllDestinations, getFeaturedDestinations, getAllRegions } from '@/lib/destinations';
import DestinationCard from '@/components/destinations/DestinationCard';

export const metadata: Metadata = {
  title: 'Destinations | Travel Unbounded',
  description: 'Explore our curated collection of extraordinary India and International travel destinations. From Kerala to Kenya, Ladakh to Iceland, discover journeys that transform.',
  keywords: 'travel destinations, India travel, international safaris, experiential travel, Kerala, Kenya, Iceland, Ladakh',
};

export default function DestinationsPage() {
  const allDestinations = getAllDestinations();
  const featuredDestinations = getFeaturedDestinations();
  const regions = getAllRegions();

  // Group destinations by region
  const destinationsByRegion = regions.map(region => ({
    region,
    destinations: allDestinations.filter(dest => dest.region === region),
  }));

  return (
    <main className="pt-20">
      {/* Page Header */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
        <div className="container-content">
          <div className="max-w-3xl">
            <h1 className="heading-display text-[var(--color-text-primary)] mb-6">
              Extraordinary Destinations
            </h1>
            <p className="body-large text-[var(--color-text-secondary)]">
              Every destination we offer has been personally explored and curated by our travel experts. These aren&apos;t just places—they&apos;re transformative experiences waiting to unfold.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featuredDestinations.length > 0 && (
        <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
          <div className="container-content">
            <h2 className="heading-section text-[var(--color-text-primary)] mb-12">
              Featured Journeys
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  priority={index === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destinations by Region */}
      {destinationsByRegion.map(({ region, destinations }) => (
        <section key={region} className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
          <div className="container-content">
            <h2 className="heading-section text-[var(--color-text-primary)] mb-12">
              {region}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map(destination => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
        <div className="container-content text-center">
          <h2 className="heading-section text-[var(--color-text-primary)] mb-6">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="body-large text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            We specialize in creating bespoke travel experiences. If you have a destination in mind that isn&apos;t listed here, we&apos;d love to help you design the perfect journey.
          </p>
          <a href="/contact" className="btn btn-primary">
            Get in Touch
          </a>
        </div>
      </section>
    </main>
  );
}
