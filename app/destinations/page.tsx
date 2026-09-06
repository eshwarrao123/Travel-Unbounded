import { Metadata } from 'next';
import Link from 'next/link';
import { getIndiaDestinations, getInternationalDestinations } from '@/lib/destinations';
import DestinationCard from '@/components/destinations/DestinationCard';

export const metadata: Metadata = {
  title: 'Destinations | Travel Unbounded',
  description: 'Explore our curated collection of India and International travel destinations. From Kerala to Kenya, Ladakh to Iceland, discover journeys that transform.',
  keywords: 'travel destinations, India travel, international safaris, experiential travel, Kerala, Kenya, Iceland, Ladakh',
};

// Destinations are read from MongoDB; render per request so CMS edits appear immediately.
export const dynamic = 'force-dynamic';

export default async function DestinationsPage() {
  const indiaDestinations = await getIndiaDestinations();
  const internationalDestinations = await getInternationalDestinations();

  return (
    <main className="page-top">
      {/* Page Header */}
      <section className="py-14 md:py-20 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-tertiary)] block mb-3">
              Our Portfolio
            </span>
            <h1 className="heading-display text-[var(--color-text-primary)] mb-5">
              Extraordinary Destinations
            </h1>
            <p className="body-large text-[var(--color-text-secondary)] max-w-2xl">
              Every destination we offer has been personally explored and curated by our travel experts. These aren&apos;t just places â€” they&apos;re transformative experiences waiting to unfold.
            </p>
          </div>
        </div>
      </section>

      {/* India Destinations */}
      <section className="py-14 md:py-20 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)]">
                Domestic Expeditions
              </span>
            </div>
            <h2 className="heading-section text-[var(--color-text-primary)] mb-3">
              India Destinations
            </h2>
            <p className="body text-[var(--color-text-secondary)] max-w-2xl">
              From palm-fringed backwater sanctuaries to snow-capped Himalayan passes â€” immersive journeys across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {indiaDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                priority={index < 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* International Destinations */}
      <section className="py-14 md:py-20 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white border border-[var(--color-border)]">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)]">
                Global Journeys
              </span>
            </div>
            <h2 className="heading-section text-[var(--color-text-primary)] mb-3">
              International Destinations
            </h2>
            <p className="body text-[var(--color-text-secondary)] max-w-2xl">
              Bespoke global frontiers â€” from the wild Mara savannahs to emerald bays and volcanic Arctic springs.
            </p>
          </div>

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

      {/* Call to Action */}
      <section className="py-14 md:py-20 bg-[var(--color-bg-primary)]">
        <div className="container-content flex justify-center">
          <div className="w-full max-w-2xl mx-auto text-center flex flex-col items-center justify-center">
            <h2 className="heading-section text-[var(--color-text-primary)] text-center mb-4 w-full">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="body-large text-[var(--color-text-secondary)] text-center mb-8 w-full">
              We specialize in creating bespoke travel experiences. If you have a destination in mind that isn&apos;t listed here, we&apos;d love to help you design the perfect journey.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
