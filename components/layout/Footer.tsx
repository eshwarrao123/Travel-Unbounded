import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-text-primary)] text-white py-14 md:py-16">
      <div className="container-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Travel Unbounded</h3>
            <p className="body-small text-white/70 mb-5 max-w-sm">
              India&apos;s most trusted experiential travel experts. Crafting extraordinary, human-curated journeys across India and the globe.
            </p>
            <div className="space-y-1.5 body-small text-white/60">
              <p>541, 7th Main Rd, HAL 2nd Stage</p>
              <p>Indiranagar, Bengaluru – 560008, India</p>
              <p className="pt-1">enquiry@travelunbounded.com</p>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Destinations</h4>
            <ul className="space-y-2.5">
              {['Kerala', 'Ladakh', 'Himachal Pradesh', 'Kenya', 'Iceland'].map((dest) => (
                <li key={dest}>
                  <Link
                    href={`/destinations/${dest.toLowerCase().replace(/ /g, '-')}`}
                    className="body-small text-white/70 hover:text-white transition-colors"
                  >
                    {dest}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="body-small text-white/70 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="body-small text-white/70 hover:text-white transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link href="/contact" className="body-small text-white/70 hover:text-white transition-colors">
                  Plan Your Trip
                </Link>
              </li>
              <li>
                <Link href="/contact" className="body-small text-white/70 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="body-small text-white/50">
              &copy; {new Date().getFullYear()} Travel Unbounded. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/contact" className="body-small text-white/50 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="body-small text-white/50 hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
