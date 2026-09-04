import React from 'react';

type StatusType =
  | 'PAID'
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'REVOKED'
  | 'ACTIVE'
  | 'DRAFT'
  | 'ARCHIVED'
  | 'OWNER'
  | 'ADMIN'
  | 'SUPPORT';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; pulse?: boolean }
> = {
  // Positive / Completed / Verified / Paid
  PAID: {
    label: 'Paid',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  VERIFIED: {
    label: 'Verified',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  AVAILABLE: {
    label: 'Available',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  ACTIVE: {
    label: 'Active',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },

  // Pending / Submitted (Needs Attention)
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    pulse: true,
  },
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    pulse: true,
  },
  PAYMENT_SUBMITTED: {
    label: 'Verify TrxID',
    bg: 'bg-amber-500/15 dark:bg-amber-500/20',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    pulse: true,
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    pulse: true,
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    pulse: true,
  },
  RESERVED: {
    label: 'Reserved',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },

  // Negative / Cancelled / Rejected / Sold
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
  },
  REVOKED: {
    label: 'Revoked',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
  },
  REFUNDED: {
    label: 'Refunded',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
  SOLD: {
    label: 'Sold',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },
  ARCHIVED: {
    label: 'Archived',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },

  // Roles
  OWNER: {
    label: 'Owner',
    bg: 'bg-violet-500/15 dark:bg-violet-500/20',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-500/30',
    dot: 'bg-violet-500',
  },
  ADMIN: {
    label: 'Admin',
    bg: 'bg-indigo-500/15 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  SUPPORT: {
    label: 'Support',
    bg: 'bg-teal-500/15 dark:bg-teal-500/20',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-500/30',
    dot: 'bg-teal-500',
  },
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
  lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
};

export default function StatusBadge({
  status,
  size = 'md',
  className = '',
  showDot = true,
}: StatusBadgeProps) {
  const normKey = (status || '').toUpperCase().trim();
  const config = statusConfig[normKey] || {
    label: status,
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide transition-colors ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          {config.pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
}

