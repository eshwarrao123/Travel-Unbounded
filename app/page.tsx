import Hero from '@/components/home/Hero';
import IndiaDestinations from '@/components/home/IndiaDestinations';
import InternationalDestinations from '@/components/home/InternationalDestinations';
import ValueProposition from '@/components/home/ValueProposition';
import TravelStory from '@/components/home/TravelStory';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <main>
      <Hero />
      <IndiaDestinations />
      <InternationalDestinations />
      <ValueProposition />
      <TravelStory />
      <CallToAction />
    </main>
  );
}
