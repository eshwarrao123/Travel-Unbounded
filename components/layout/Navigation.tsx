'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="container-content">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]">
              Travel Unbounded
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/destinations" 
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Destinations
            </Link>
            <Link 
              href="/experiences" 
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Experiences
            </Link>
            <Link 
              href="/about" 
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/enquire" 
              className="btn btn-primary"
            >
              Plan Your Journey
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[var(--color-text-primary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-[var(--color-border)]">
            <div className="flex flex-col gap-4">
              <Link 
                href="/destinations" 
                className="text-[var(--color-text-primary)] text-lg py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link 
                href="/experiences" 
                className="text-[var(--color-text-primary)] text-lg py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                href="/about" 
                className="text-[var(--color-text-primary)] text-lg py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-[var(--color-text-primary)] text-lg py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/enquire" 
                className="btn btn-primary mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan Your Journey
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
