import clsx from 'clsx';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = '🔍', title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      <div className="mb-4 text-5xl" role="img" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
