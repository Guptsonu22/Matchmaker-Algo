import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-border bg-white px-6">
      <div>
        {title && <h2 className="font-serif text-lg font-semibold text-gray-900">{title}</h2>}
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
          Demo Mode • Synthetic Data
        </span>
        <div className="h-4 w-px bg-gray-200" />
        <div className="text-right text-xs">
          <p className="font-medium text-gray-700">{user?.fullName}</p>
          <p className="text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="btn-secondary px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          title="Sign out of dashboard"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
