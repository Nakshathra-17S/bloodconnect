import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let color = 'bg-neutral-100 text-neutral-700 border-neutral-300';

  switch (status) {
    case 'Available':
    case 'Verified':
    case 'Fulfilled':
    case 'Accepted':
    case 'active':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      break;
    case 'Pending':
    case 'Matching Donors':
    case 'Requests Sent':
    case 'Partially Fulfilled':
      color = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'Urgent':
      color = 'bg-orange-50 text-orange-800 border-orange-300 font-bold';
      break;
    case 'Emergency':
      color = 'bg-red-50 text-blood-700 border-red-300 font-extrabold animate-pulse';
      break;
    case 'Temporarily Unavailable':
      color = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'Unavailable':
    case 'Cancelled':
    case 'Expired':
    case 'Rejected':
    case 'suspended':
    case 'deactivated':
      color = 'bg-neutral-100 text-neutral-600 border-neutral-300';
      break;
    default:
      color = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${padding} ${color} tracking-tight`}
    >
      {status}
    </span>
  );
};
