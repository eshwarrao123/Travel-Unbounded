import Image from 'next/image';

interface DestinationHeroProps {
  name: string;
  country: string;
  shortDescription: string;
  heroImage: string;
}

export default function DestinationHero({ name, country, shortDescription, heroImage }: DestinationHeroProps) {
  return (
    <section className="relative min-h-[70vh] flex items-center pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={`${name}, ${country}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-content relative z-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-wider text-white/90 mb-4">{country}</p>
          <h1 className="heading-display text-white mb-4">
            {name}
          </h1>
          <p className="body-large text-white/95">
            {shortDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
