import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean;
}

export default function DestinationCard({ destination, priority = false }: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block relative overflow-hidden aspect-[4/5]"
    >
      <Image
        src={destination.heroImage}
        alt={`${destination.name} - ${destination.shortDescription}`}
        fill
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <p className="text-sm uppercase tracking-wider mb-2 opacity-90">{destination.region}</p>
        <h3 className="heading-subsection mb-2">{destination.name}</h3>
        <p className="body-small opacity-90">{destination.shortDescription}</p>
      </div>
    </Link>
  );
}
