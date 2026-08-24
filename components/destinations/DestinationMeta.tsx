interface DestinationMetaProps {
  duration: string;
  bestTimeToVisit: string[];
  startingPrice?: number;
}

export default function DestinationMeta({ duration, bestTimeToVisit, startingPrice }: DestinationMetaProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-[var(--color-bg-secondary)]">
      <div className="text-center md:text-left">
        <p className="text-sm uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">
          Duration
        </p>
        <p className="heading-subsection text-[var(--color-text-primary)]">
          {duration}
        </p>
      </div>
      <div className="text-center md:text-left">
        <p className="text-sm uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">
          Best Time to Visit
        </p>
        <p className="heading-subsection text-[var(--color-text-primary)]">
          {bestTimeToVisit.join(', ')}
        </p>
      </div>
      {startingPrice && (
        <div className="text-center md:text-left">
          <p className="text-sm uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">
            Starting From
          </p>
          <p className="heading-subsection text-[var(--color-text-primary)]">
            ${startingPrice.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
