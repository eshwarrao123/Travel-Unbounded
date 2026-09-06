import { EnquiryStatus } from '@/types/enquiry';

interface StatusBadgeProps {
  status: EnquiryStatus;
  size?: 'sm' | 'md';
}

/**
 * StatusBadge — Restrained status indicator for operations pipeline
 * Uses Travel Unbounded design language with calm, legible tones
 */
export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center font-medium border rounded select-none ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${config.dotClassName}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

function getStatusConfig(status: EnquiryStatus) {
  switch (status) {
    case 'New':
      return {
        className: 'bg-blue-50/80 text-blue-700 border-blue-200/80',
        dotClassName: 'bg-blue-500',
      };
    case 'Contacted':
      return {
        className: 'bg-amber-50/80 text-amber-800 border-amber-200/80',
        dotClassName: 'bg-amber-500',
      };
    case 'Converted':
      return {
        className: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80',
        dotClassName: 'bg-emerald-600',
      };
    case 'Closed':
      return {
        className: 'bg-stone-100 text-stone-600 border-stone-200',
        dotClassName: 'bg-stone-400',
      };
    default:
      return {
        className: 'bg-stone-100 text-stone-600 border-stone-200',
        dotClassName: 'bg-stone-400',
      };
  }
}

