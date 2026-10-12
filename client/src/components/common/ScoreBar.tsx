import clsx from 'clsx';
import { getScoreColor } from '@/utils/scoreHelpers';

interface ScoreBarProps {
  label: string;
  value: number;
  max: number;
  icon?: string;
  className?: string;
  showPercent?: boolean;
}

export function ScoreBar({
  label,
  value,
  max,
  icon,
  className,
  showPercent = false,
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const color = getScoreColor(percentage);

  const fillColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  const textColors: Record<string, string> = {
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    orange: 'text-orange-700',
    red: 'text-red-700',
  };

  return (
    <div className={clsx('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{label}</span>
        </span>
        <span className={clsx('font-semibold', textColors[color] || 'text-gray-700')}>
          {value}/{max}
          {showPercent && ` (${percentage}%)`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={clsx('h-full transition-all duration-300 rounded-full', fillColors[color] || 'bg-brand-accent')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
