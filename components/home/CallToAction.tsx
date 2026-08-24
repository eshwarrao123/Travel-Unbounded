import Link from 'next/link';
import Image from 'next/image';

export default function CallToAction() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2831&auto=format&fit=crop"
          alt="Traveler gazing at sunset over ocean"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container-content relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-section text-white mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="body-large text-white/95 mb-10 max-w-2xl mx-auto">
            Let&apos;s craft an experience uniquely tailored to your interests, timeline, and travel aspirations. Our team is ready to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/enquire" className="btn btn-primary">
              Start Planning
            </Link>
            <Link href="/contact" className="btn btn-secondary bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-[var(--color-text-primary)]">
              Get in Touch
            </Link>
          </div>
          <p className="body-small text-white/80 mt-8">
            No obligations. Just a conversation about possibilities.
          </p>
        </div>
      </div>
    </section>
  );
}
