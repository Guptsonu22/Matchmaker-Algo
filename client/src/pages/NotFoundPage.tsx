import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-6xl block">💍</span>
        <h1 className="font-serif text-3xl font-bold text-gray-900">404 — Page Not Found</h1>
        <p className="text-sm text-gray-500">
          The requested matchmaking record or operational screen doesn't exist or was moved.
        </p>
        <div className="pt-2">
          <Link to="/" className="btn-primary text-xs py-2 px-5">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
