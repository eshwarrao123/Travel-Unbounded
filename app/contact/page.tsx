import { Metadata } from 'next';
import Image from 'next/image';
import BookingEnquiryForm from '@/components/contact/BookingEnquiryForm';

export const metadata: Metadata = {
  title: 'Plan Your Trip | Travel Unbounded',
  description: 'Submit your travel enquiry with Travel Unbounded. Get personalized itineraries for India and international destinations from our experiential travel experts.',
  keywords: 'plan trip, travel enquiry, booking form, custom itineraries, Travel Unbounded contact, luxury travel enquiry',
};

export default function ContactPage() {
  return (
    <main className="pt-20">
      {/* Hero Banner Section */}
      <section className="relative py-16 md:py-24 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2940&auto=format&fit=crop"
            alt="Plan your travel background"
            fill
            priority
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-[var(--color-bg-primary)]/40" />
        </div>

        <div className="container-content relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full">
              Bespoke Journey Planning
            </span>
            <h1 className="heading-display text-[var(--color-text-primary)] mb-4">
              Plan Your Trip
            </h1>
            <p className="body-large text-[var(--color-text-secondary)]">
              Tell us your travel vision, preferences, and dates. Our travel concierges will design a tailored, end-to-end itinerary for your dream destination.
            </p>
          </div>
        </div>
      </section>

      {/* Form & Contact Info Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column: Contact & Trust Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-tertiary)] block mb-2">
                  Direct Concierge
                </span>
                <h2 className="heading-section text-[var(--color-text-primary)] mb-4">
                  We Are Here to Guide Your Journey
                </h2>
                <p className="body text-[var(--color-text-secondary)] leading-relaxed">
                  Whether you are planning a serene Kerala backwater retreat, a high-altitude Ladakh trek, or a private Kenya safari, our experts handle every detail with personal care.
                </p>
              </div>

              {/* Contact Card Details */}
              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 md:p-8 rounded-xl space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-tertiary)] mb-2">
                    Headquarters
                  </h3>
                  <address className="not-italic body-small text-[var(--color-text-primary)] leading-relaxed font-medium">
                    Travel Unbounded Private Limited<br />
                    541, 7th Main Rd, HAL 2nd Stage<br />
                    Indiranagar, Bengaluru – 560008, India
                  </address>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] space-y-3 body-small">
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--color-accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>enquiry@travelunbounded.com</span>
                  </div>

                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--color-accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+91 (80) 4123 5678 / +91 98765 43210</span>
                  </div>

                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--color-accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="body-small text-[var(--color-text-secondary)]">
                    <strong className="text-[var(--color-text-primary)]">Guaranteed 24-Hour Response:</strong> Our concierges review every enquiry promptly and provide initial consultation options within one business day.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="body-small text-[var(--color-text-secondary)]">
                    <strong className="text-[var(--color-text-primary)]">Zero Obligation Consultation:</strong> Customizing your itinerary, hotel preferences, and activities is completely free.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Enquiry Form */}
            <div className="lg:col-span-7">
              <BookingEnquiryForm />
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
