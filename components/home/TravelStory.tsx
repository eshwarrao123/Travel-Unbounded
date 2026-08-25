import Image from 'next/image';

export default function TravelStory() {
  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Grid */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2821&auto=format&fit=crop"
                  alt="Traveler with backpack overlooking mountain vista"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="aspect-[3/4] relative overflow-hidden mt-8">
                <Image
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2940&auto=format&fit=crop"
                  alt="Serene lake reflection with mountains"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="aspect-[4/3] relative overflow-hidden col-span-2 -mt-4">
                <Image
                  src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2940&auto=format&fit=crop"
                  alt="Desert landscape with winding road"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="text-sm uppercase tracking-wider text-[var(--color-accent)] mb-4">
              Our Philosophy
            </div>
            <h2 className="heading-section text-[var(--color-text-primary)] mb-6">
              The Journey Is the Destination
            </h2>
            <div className="space-y-6 text-[var(--color-text-secondary)]">
              <p className="body-large">
                Travel isn&apos;t about checking boxes or collecting passport stamps. It&apos;s about the unexpected conversations, the quiet moments of wonder, and the perspectives that shift when you step outside your familiar world.
              </p>
              <p className="body">
                We craft journeys that go deeper than the surface. We work with local guides who share their homes and stories, not just their knowledge. We choose accommodations that reflect the character of a place, not the uniformity of a brand.
              </p>
              <p className="body">
                Our travelers come back changed—not because they saw famous landmarks, but because they connected with people, landscapes, and cultures in ways that matter.
              </p>
              <blockquote className="border-l-2 border-[var(--color-accent)] pl-6 italic">
                &ldquo;Travel Unbounded didn&apos;t just show us Japan—they helped us understand it. Every day brought new layers of meaning, guided by people who genuinely cared about our experience.&rdquo;
                <footer className="not-italic text-sm mt-2 text-[var(--color-text-tertiary)]">
                  — Sarah & Michael, Tokyo to Kyoto Journey
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
