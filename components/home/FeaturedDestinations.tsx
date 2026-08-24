import Image from 'next/image';
import Link from 'next/link';

const destinations = [
  {
    id: 1,
    name: 'Iceland',
    tagline: 'Land of Fire and Ice',
    description: 'Witness the raw power of nature where glaciers meet volcanoes, and the Northern Lights dance across Arctic skies.',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?q=80&w=2940&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 2,
    name: 'Japan',
    tagline: 'Ancient Traditions, Modern Wonders',
    description: 'From tranquil temples to neon-lit streets, experience a culture where tradition and innovation coexist beautifully.',
    image: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?q=80&w=2940&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 3,
    name: 'Patagonia',
    tagline: 'The Edge of the World',
    description: 'Trek through pristine wilderness where jagged peaks pierce the sky and glaciers carve through ancient landscapes.',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2787&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 4,
    name: 'Morocco',
    tagline: 'A Feast for the Senses',
    description: 'Lose yourself in vibrant souks, Saharan dunes, and the warm hospitality of a land where every corner tells a story.',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=2787&auto=format&fit=crop',
    featured: false,
  },
];

export default function FeaturedDestinations() {
  const featured = destinations.find(d => d.featured);
  const others = destinations.filter(d => !d.featured);

  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
      <div className="container-content">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="heading-section text-[var(--color-text-primary)] mb-4">
            Curated Destinations
          </h2>
          <p className="body-large text-[var(--color-text-secondary)] max-w-2xl">
            Every journey begins with a destination that calls to you. Explore our handpicked selection of extraordinary places.
          </p>
        </div>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Featured Destination - Large */}
          {featured && (
            <Link 
              href={`/destinations/${featured.id}`}
              className="group relative overflow-hidden aspect-[4/5] lg:row-span-2"
            >
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                <p className="text-sm uppercase tracking-wider mb-2 opacity-90">Featured</p>
                <h3 className="heading-subsection mb-2">{featured.name}</h3>
                <p className="body-small opacity-90 mb-3">{featured.tagline}</p>
                <p className="body max-w-lg opacity-95">{featured.description}</p>
              </div>
            </Link>
          )}

          {/* Other Destinations - Asymmetric Grid */}
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {others.map((destination, index) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.id}`}
                className={`group relative overflow-hidden ${
                  index === 0 ? 'aspect-[16/9]' : 'aspect-[3/2]'
                }`}
              >
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="heading-subsection mb-2">{destination.name}</h3>
                  <p className="body-small opacity-90">{destination.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link href="/destinations" className="btn btn-secondary">
            View All Destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
