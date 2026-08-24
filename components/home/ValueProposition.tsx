import Image from 'next/image';

const values = [
  {
    title: 'Expert Curation',
    description: 'Every destination and experience is personally vetted by our travel experts who have spent years exploring the world&apos;s hidden gems.',
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
              We believe the best travel experiences come from deep expertise, local knowledge, and an unwavering commitment to quality. This isn&apos;t just a trip—it&apos;s a transformation.
            </p>

            {/* Value Points */}
            <div className="space-y-6">
              {values.map((value, index) => (
                <div key={index} className="border-l-2 border-[var(--color-accent)] pl-6">
                  <h3 className="heading-subsection text-[var(--color-text-primary)] mb-2">
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
            
            {/* Stats Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 md:p-8">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-light text-[var(--color-accent)] mb-1">
                    50+
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Destinations
                  </div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-light text-[var(--color-accent)] mb-1">
                    15
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Years Experience
                  </div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-light text-[var(--color-accent)] mb-1">
                    98%
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Satisfaction
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
