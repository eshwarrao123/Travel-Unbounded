import Hero from '@/components/home/Hero';
import FeaturedDestinations from '@/components/home/FeaturedDestinations';
import ValueProposition from '@/components/home/ValueProposition';
import TravelStory from '@/components/home/TravelStory';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedDestinations />
      <ValueProposition />
      <TravelStory />
      <CallToAction />
    </main>
  );
}

