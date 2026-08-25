import Image from 'next/image';

const values = [
  {
    title: 'Expert Curation',
    description: 'Every destination and experience is personally vetted by our travel experts who have explored the world\'s finest corners — and know which ones are truly worth your time.',
  },
  {
    title: 'Authentic Connections',
    description: 'We prioritize deep cultural immersion and genuine local interactions over superficial tourist experiences.',
  },
  {
    title: 'Seamless Logistics',
    description: 'From the moment you enquire to your safe return home, every detail is thoughtfully managed so you can focus on the journey.',
  },
];

export default function ValueProposition() {
  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <h2 className="heading-section text-[var(--color-text-primary)] mb-6">
              Travel Reimagined
            </h2>
            <p className="body text-[var(--color-text-secondary)] mb-8">
              We believe the best travel experiences come from deep expertise, local knowledge, and an unwavering commitment to quality. This isn&apos;t just a trip — it&apos;s a transformation.
            </p>

            {/* Value Points */}
            <div className="space-y-6">
              {values.map((value, index) => (
                <div key={index} className="border-l-2 border-[var(--color-accent)] pl-5">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1.5">
                    {value.title}
                  </h3>
                  <p className="body-small text-[var(--color-text-secondary)]">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-3 relative">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2835&auto=format&fit=crop"
                alt="Travelers experiencing authentic local culture"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>

            {/* Principles Overlay — factual product values, not invented statistics */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1.5">
                    Experience
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Personally Vetted
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1.5">
                    Offices
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                    3 Global Hubs
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1.5">
                    Support
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                    24 / 7 Concierge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
