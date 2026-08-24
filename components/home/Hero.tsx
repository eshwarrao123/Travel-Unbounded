import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop"
          alt="Majestic mountain landscape at sunrise"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-content relative z-10">
        <div className="max-w-3xl">
          <h1 className="heading-display text-white mb-6">
            Journey Beyond Boundaries
          </h1>
          <p className="body-large text-white/95 mb-8 max-w-2xl">
            Discover extraordinary travel experiences crafted by experts who know that the best journeys are measured not in miles, but in moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/destinations" className="btn btn-primary">
              Explore Destinations
            </Link>
            <Link href="/about" className="btn btn-secondary bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-[var(--color-text-primary)]">
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-sm uppercase tracking-wider">Scroll</span>
          <svg 
            className="w-6 h-6 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
