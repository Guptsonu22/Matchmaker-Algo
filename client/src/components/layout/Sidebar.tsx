import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/customers',
      label: 'Customers',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={clsx(
        'flex flex-col bg-brand-sidebar text-white transition-all duration-200 border-r border-gray-800',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent text-white font-serif font-bold text-lg shadow-sm">
          DC
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-serif text-base font-semibold tracking-wide text-white">
              The Date Crew
            </h1>
            <p className="text-[11px] font-medium tracking-wider uppercase text-rose-300">
              Matchmaker Ops
            </p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white shadow-xs'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/30 text-rose-200 text-xs font-semibold">
            {user?.fullName?.charAt(0) || 'M'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-[10px] text-gray-400 capitalize">
                {user?.role?.replace('_', ' ') || 'Matchmaker'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
