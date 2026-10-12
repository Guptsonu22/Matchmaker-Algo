import clsx from 'clsx';
import type { JourneyStatus, VerificationStatus } from '@/types';
import { JOURNEY_STATUS_LABEL, VERIFICATION_LABEL } from '@/utils/formatters';

// ─── Journey Status Badge ─────────────────────────────────────────────────────

const JOURNEY_COLORS: Record<JourneyStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  matched: 'bg-purple-50 text-purple-700 ring-purple-200',
  closed: 'bg-gray-100 text-gray-600 ring-gray-200',
};

const JOURNEY_DOTS: Record<JourneyStatus, string> = {
  new: 'bg-blue-500',
  active: 'bg-emerald-500',
  matched: 'bg-purple-500',
  closed: 'bg-gray-400',
};

export function JourneyBadge({ status }: { status: JourneyStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        JOURNEY_COLORS[status],
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', JOURNEY_DOTS[status])} />
      {JOURNEY_STATUS_LABEL[status]}
    </span>
  );
}

// ─── Verification Badge ───────────────────────────────────────────────────────

const VERIFICATION_COLORS: Record<VerificationStatus, string> = {
  unverified: 'bg-gray-50 text-gray-500 ring-gray-200',
  phone_verified: 'bg-sky-50 text-sky-700 ring-sky-200',
  id_submitted: 'bg-amber-50 text-amber-700 ring-amber-200',
  trust_badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const VERIFICATION_ICONS: Record<VerificationStatus, string> = {
  unverified: '○',
  phone_verified: '✓',
  id_submitted: '⊙',
  trust_badge: '★',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        VERIFICATION_COLORS[status],
      )}
      title={VERIFICATION_LABEL[status]}
    >
      <span className="font-bold">{VERIFICATION_ICONS[status]}</span>
      {VERIFICATION_LABEL[status]}
    </span>
  );
}

// ─── Generic Badge ────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const BADGE_VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-700 ring-gray-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  error: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
