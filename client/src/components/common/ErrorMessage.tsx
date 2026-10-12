import clsx from 'clsx';
import { extractErrorMessage } from '@/utils/formatters';

interface ErrorMessageProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ error, title = 'Something went wrong', onRetry, className }: ErrorMessageProps) {
  const message = extractErrorMessage(error);

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center',
        className,
      )}
      role="alert"
    >
      <div className="mb-3 text-4xl" aria-hidden="true">⚠️</div>
      <h3 className="mb-1 text-base font-semibold text-red-800">{title}</h3>
      <p className="mb-5 text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary text-sm"
          aria-label="Retry the failed request"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
