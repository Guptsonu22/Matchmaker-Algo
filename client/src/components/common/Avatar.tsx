import clsx from 'clsx';
import { getAvatarUrl } from '@/utils/formatters';
import type { Gender } from '@/types';

interface AvatarProps {
  seed: string;
  gender: Gender;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ seed, gender, name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <div
      className={clsx(
        'relative flex-shrink-0 rounded-full overflow-hidden bg-brand-accent-light',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <img
        src={getAvatarUrl(seed, gender)}
        alt={name}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to initials on load error
          e.currentTarget.style.display = 'none';
        }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center font-medium text-brand-accent"
        aria-hidden="true"
      >
        {initials}
      </span>
    </div>
  );
}
