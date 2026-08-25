import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDestinationBySlug, getAllDestinations } from '@/lib/destinations';
import DestinationHero from '@/components/destinations/DestinationHero';
import DestinationMeta from '@/components/destinations/DestinationMeta';
import ExperienceList from '@/components/destinations/ExperienceList';
import ImageGallery from '@/components/destinations/ImageGallery';

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const destinations = getAllDestinations();
  return destinations.map((destination) => ({
    slug: destination.slug,
  }));
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    return {
      title: 'Destination Not Found - Travel Unbounded',
    };
  }

  return {
    title: `${destination.name} - Travel Unbounded`,
    description: destination.description,
    keywords: `${destination.name}, ${destination.country}, ${destination.region}, travel, luxury travel, ${destination.travelStyle.join(', ')}`,
  };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  return (
    <main className="page-top">
      {/* Hero Section */}
      <DestinationHero
        name={destination.name}
        country={destination.country}
        shortDescription={destination.shortDescription}
        heroImage={destination.heroImage}
      />

      {/* Key Information */}
      <DestinationMeta
        duration={destination.duration}
        bestTimeToVisit={destination.bestTimeToVisit}
        startingPrice={destination.startingPrice}
      />

      {/* Description */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="heading-section text-[var(--color-text-primary)] mb-6">
                Discover {destination.name}
              </h2>
              <p className="body text-[var(--color-text-secondary)] mb-8">
                {destination.description}
              </p>

              {/* Travel Styles */}
              <div className="mb-8">
                <h3 className="heading-subsection text-[var(--color-text-primary)] mb-4">
                  Travel Style
                </h3>
                <div className="flex flex-wrap gap-3">
                  {destination.travelStyle.map((style) => (
                    <span
                      key={style}
                      className="px-4 py-2 bg-[var(--color-accent-light)] text-[var(--color-accent)] text-sm font-medium capitalize"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="heading-subsection text-[var(--color-text-primary)] mb-4">
                  Highlights
                </h3>
                <ul className="space-y-3">
                  {destination.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[var(--color-accent)] mt-1">✓</span>
                      <span className="body text-[var(--color-text-secondary)]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-[var(--color-bg-secondary)] p-8">
                <h3 className="heading-subsection text-[var(--color-text-primary)] mb-4">
                  Plan Your Journey
                </h3>
                <p className="body-small text-[var(--color-text-secondary)] mb-6">
                  Our travel experts will work with you to design a personalized itinerary that matches your interests and travel style.
                </p>
                <Link href="/enquire" className="btn btn-primary w-full block text-center mb-4">
                  Start Planning
                </Link>
                <Link href="/contact" className="btn btn-secondary w-full block text-center">
                  Ask a Question
                </Link>

                {/* Additional Info */}
                {destination.metadata && (
                  <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-4">
                      Essential Information
                    </h4>
                    <div className="space-y-3">
                      {destination.metadata.climate && (
                        <div>
                          <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Climate</p>
                          <p className="body-small text-[var(--color-text-secondary)]">
                            {destination.metadata.climate}
                          </p>
                        </div>
                      )}
                      {destination.metadata.language && (
                        <div>
                          <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Language</p>
                          <p className="body-small text-[var(--color-text-secondary)]">
                            {destination.metadata.language}
                          </p>
                        </div>
                      )}
                      {destination.metadata.currency && (
                        <div>
                          <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Currency</p>
                          <p className="body-small text-[var(--color-text-secondary)]">
                            {destination.metadata.currency}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
        <div className="container-content">
          <h2 className="heading-section text-[var(--color-text-primary)] mb-6">
            Signature Experiences
          </h2>
          <p className="body-large text-[var(--color-text-secondary)] mb-12 max-w-3xl">
            These curated experiences represent the essence of what makes {destination.name} extraordinary. Each can be customized or combined to create your perfect journey.
          </p>
          <ExperienceList experiences={destination.experiences} />
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
        <div className="container-content">
          <h2 className="heading-section text-[var(--color-text-primary)] mb-12">
            Gallery
          </h2>
          <ImageGallery images={destination.galleryImages} destinationName={destination.name} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
        <div className="container-content flex justify-center">
          <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center">
            <h2 className="heading-section text-[var(--color-text-primary)] text-center mb-6 w-full">
              Ready to Explore {destination.name}?
            </h2>
            <p className="body-large text-[var(--color-text-secondary)] text-center mb-8 max-w-2xl mx-auto w-full">
              Let&apos;s begin designing your journey. Our team will create a personalized itinerary that brings this destination to life in ways that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <Link href="/enquire" className="btn btn-primary">
                Start Planning Your Trip
              </Link>
              <Link href="/destinations" className="btn btn-secondary">
                Explore More Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
