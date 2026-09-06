interface DestinationMetaProps {
  duration: string;
  bestTimeToVisit: string[];
  startingPrice?: number;
}

export default function DestinationMeta({ duration, bestTimeToVisit, startingPrice }: DestinationMetaProps) {
  const items = [
    {
      label: 'Duration',
      value: duration,
    },
    {
      label: 'Best Time to Visit',
      value: bestTimeToVisit.join(' · '),
    },
    ...(startingPrice
      ? [
          {
            label: 'Starting From',
            value: `₹${startingPrice.toLocaleString('en-IN')}`,
            isPrice: true,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white border-b border-[var(--color-border)]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={`
                flex-1 py-5
                ${index < items.length - 1
                  ? 'border-b sm:border-b-0 sm:border-r border-[var(--color-border)]'
                  : ''}
                ${index > 0 ? 'sm:pl-8' : ''}
              `}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">
                {item.label}
              </p>
              <p
                className={`text-lg font-medium leading-tight ${
                  item.isPrice
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
