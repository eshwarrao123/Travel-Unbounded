import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Travel Unbounded',
  description: "Learn about Travel Unbounded, India's most trusted experiential travel experts. Discover our story, office locations in Bengaluru, Kochi, and Nairobi, and core values.",
  keywords: 'About Travel Unbounded, experiential travel experts, India travel agency, Bengaluru headquarters, Kochi office, Nairobi office, luxury travel',
};

const officeLocations = [
  {
    city: 'Bengaluru',
    role: 'Headquarters',
    addressLines: [
      '541, 7th Main Rd, HAL 2nd Stage',
      'Indiranagar, Bengaluru – 560008',
      'India',
    ],
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2940&auto=format&fit=crop',
    tag: 'HQ & Operations',
  },
  {
    city: 'Kochi',
    role: 'Kerala Office',
    addressLines: [
      'LR Towers, S Janatha Road',
      'Palavivatton, Kochi – 682025',
      'India',
    ],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2940&auto=format&fit=crop',
    tag: 'South India Hub',
  },
  {
    city: 'Nairobi',
    role: 'Kenya Office',
    addressLines: [
      'Westpark Towers, Muthithi Road',
      'Nairobi, P.O. Box 6950',
      'Postal Code 00100',
      'Kenya',
    ],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2940&auto=format&fit=crop',
    tag: 'East Africa Hub',
  },
];

const whyChooseUsValues = [
  {
    title: 'Personally-Vetted Experiences',
    description:
      'Every resort, wilderness lodge, private trail, and cultural encounter we recommend has been personally experienced and vetted by our senior travel team.',
    icon: (
      <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Local Expertise & Native Guides',
    description:
      'We partner exclusively with indigenous naturalists, historians, and local guides who unlock insider access and share genuine cultural stories.',
    icon: (
      <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Tailor-Made Custom Itineraries',
    description:
      'No rigid mass-market packages. Every itinerary is crafted around your unique pace, passions, accommodation preferences, and travel style.',
    icon: (
      <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: '24x7 Dedicated Support',
    description:
      'Enjoy complete peace of mind with 24-hour concierge oversight and dedicated emergency ground assistance from takeoff to your return home.',
    icon: (
      <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-[var(--color-bg-primary)] overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2948&auto=format&fit=crop"
            alt="Travel Unbounded - Experiential Travel"
            fill
            priority
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-[var(--color-bg-primary)]/50" />
        </div>

        <div className="container-content relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full">
              Our Identity & Purpose
            </span>
            <h1 className="heading-display text-[var(--color-text-primary)] mb-6">
              India’s Most Trusted Experiential Travel Experts
            </h1>
            <p className="body-large text-[var(--color-text-secondary)]">
              Crafting extraordinary, human-curated journeys that blend comfort, deep local culture, and raw nature across India and the globe.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-tertiary)] block">
                The Travel Unbounded Story
              </span>
              <h2 className="heading-section text-[var(--color-text-primary)]">
                Journeys Built Around the People Taking Them
              </h2>
              <div className="space-y-4 body text-[var(--color-text-secondary)] leading-relaxed">
                <p>
                  Travel Unbounded was born from a simple belief — that the best journeys aren&apos;t sold from a catalogue. They&apos;re built around the people taking them.
                </p>
                <p>
                  Headquartered in Bangalore with offices in Kerala and Nairobi, we design trips that blend comfort, culture, and raw nature. Every destination, resort, and activity we recommend has been personally experienced by our team.
                </p>
                <p>
                  From spotting the Big Five at dawn in the Masai Mara to cruising Ha Long Bay at sunset — we go where real stories are written, and we bring you along.
                </p>
              </div>

              {/* Accent Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border)]">
                <div>
                  <span className="block text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)]">
                    100%
                  </span>
                  <span className="body-small text-[var(--color-text-tertiary)]">
                    Personally Vetted
                  </span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)]">
                    3
                  </span>
                  <span className="body-small text-[var(--color-text-tertiary)]">
                    Global Hub Offices
                  </span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)]">
                    24/7
                  </span>
                  <span className="body-small text-[var(--color-text-tertiary)]">
                    Concierge Support
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Image Stack */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-[var(--color-border)] shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2940&auto=format&fit=crop"
                  alt="Experiential travel scenery"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[var(--color-bg-secondary)] p-6 rounded-lg border border-[var(--color-border)] hidden md:block max-w-xs shadow-lg">
                <p className="body-small font-medium text-[var(--color-text-primary)] italic">
                  &ldquo;We don&apos;t just book trips; we create memories that stay with you forever.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-12 md:mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-tertiary)] block mb-2">
              Our Core Philosophy
            </span>
            <h2 className="heading-section text-[var(--color-text-primary)] mb-4">
              Why Choose Travel Unbounded
            </h2>
            <p className="body-large text-[var(--color-text-secondary)]">
              Our commitment to excellence ensures every expedition meets the highest standards of safety, authenticity, and personal care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChooseUsValues.map((value, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border border-[var(--color-border)] rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="heading-subsection text-[var(--color-text-primary)] mb-3">
                  {value.title}
                </h3>
                <p className="body text-[var(--color-text-secondary)] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="max-w-2xl mb-12 md:mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-tertiary)] block mb-2">
              Global Presence
            </span>
            <h2 className="heading-section text-[var(--color-text-primary)] mb-4">
              Our Office Locations
            </h2>
            <p className="body-large text-[var(--color-text-secondary)]">
              Headquartered in India with ground presence across key travel gateways to serve our guests seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {officeLocations.map((office, idx) => (
              <div
                key={idx}
                className="flex flex-col bg-white border border-[var(--color-border)] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] w-full bg-gray-100">
                  <Image
                    src={office.image}
                    alt={`${office.city} - ${office.role}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                      {office.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{office.city}</h3>
                    <p className="text-xs text-white/80 uppercase tracking-wider">{office.role}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <address className="not-italic space-y-1.5 body-small text-[var(--color-text-secondary)] mb-6">
                    {office.addressLines.map((line, lineIdx) => (
                      <span key={lineIdx} className="block">
                        {line}
                      </span>
                    ))}
                  </address>

                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
                    <span>Mon - Sat: 9:00 - 18:00</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">Verified Address</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)] text-center">
        <div className="container-content max-w-3xl">
          <h2 className="heading-section text-[var(--color-text-primary)] mb-6">
            Ready to Begin Your Next Journey?
          </h2>
          <p className="body-large text-[var(--color-text-secondary)] mb-8">
            Connect with our travel experts today to start planning your bespoke itinerary tailored precisely to your vision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn btn-primary w-full sm:w-auto">
              Contact Our Experts
            </Link>
            <Link href="/destinations" className="btn btn-secondary w-full sm:w-auto">
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
