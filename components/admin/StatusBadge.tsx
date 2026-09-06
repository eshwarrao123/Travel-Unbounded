import { EnquiryStatus } from '@/types/enquiry';

interface StatusBadgeProps {
  status: EnquiryStatus;
}

/**
 * StatusBadge — Restrained status indicator for enquiries table
 * Uses Travel Unbounded design language with subtle, readable tones
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${config.className}`}
      style={{ borderRadius: '0.1875rem' }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotClassName}`}
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
        className: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClassName: 'bg-blue-500',
      };
    case 'Contacted':
      return {
        className: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClassName: 'bg-amber-500',
      };
    case 'Converted':
      return {
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClassName: 'bg-emerald-500',
      };
    case 'Closed':
      return {
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        dotClassName: 'bg-gray-400',
      };
    default:
      return {
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        dotClassName: 'bg-gray-400',
      };
  }
}
