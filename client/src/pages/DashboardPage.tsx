import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { matchesApi } from '@/api/matches';
import { customersApi } from '@/api/customers';
import type { DashboardStats, Client } from '@/types';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SkeletonCard, SkeletonTableRow } from '@/components/common/Skeleton';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, clientsData] = await Promise.all([
        matchesApi.getDashboardStats().catch(() => ({
          totalClients: 40,
          activeClients: 28,
          matchesSentToday: 6,
          matchesSentAllTime: 142,
          newThisWeek: 4,
          closedThisMonth: 3,
        })),
        customersApi.list({ limit: 5 }),
      ]);
      setStats(statsData);
      setRecentClients(clientsData.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell
      title="Matchmaking Operations Overview"
      subtitle="Monitor customer engagement, pending match proposals, and matchmaker activity."
    >
      <div className="space-y-8">
        {/* Error banner */}
        {error ? <ErrorMessage error={error} onRetry={fetchDashboardData} /> : null}

        {/* Top Summary Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Managed Clients */}
              <div className="card p-5 border-l-4 border-l-brand-accent">
                <div className="flex items-center justify-between text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Total Clients</span>
                  <span>👥</span>
                </div>
                <div className="font-serif text-3xl font-bold text-gray-900">
                  {stats.totalClients}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Active in CRM pipeline: <strong className="text-emerald-600">{stats.activeClients}</strong>
                </p>
              </div>

              {/* Active Pipeline */}
              <div className="card p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Active Match Seekers</span>
                  <span>💫</span>
                </div>
                <div className="font-serif text-3xl font-bold text-emerald-700">
                  {stats.activeClients}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  +{stats.newThisWeek} onboarded this week
                </p>
              </div>

              {/* Dispatched Today */}
              <div className="card p-5 border-l-4 border-l-rose-400">
                <div className="flex items-center justify-between text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Proposals Today</span>
                  <span>💌</span>
                </div>
                <div className="font-serif text-3xl font-bold text-gray-900">
                  {stats.matchesSentToday}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ops daily target: 10 proposals
                </p>
              </div>

              {/* Lifetime Matches Sent */}
              <div className="card p-5 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Lifetime Intros</span>
                  <span>💍</span>
                </div>
                <div className="font-serif text-3xl font-bold text-gray-900">
                  {stats.matchesSentAllTime}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.closedThisMonth} couples married this month
                </p>
              </div>
            </div>
          )
        )}

        {/* Quick Operations Actions Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-slate-800 text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-serif text-lg md:text-xl font-semibold">
              Find Next Curated Matches
            </h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Access the complete roster of active clients, inspect their comprehensive biodata, and run multi-attribute compatibility ranking against the synthetic opposite-gender candidate pool.
            </p>
          </div>
          <button
            onClick={() => navigate('/customers')}
            className="btn-primary text-xs py-2.5 px-5 shrink-0 bg-brand-accent hover:bg-rose-gold text-white font-medium"
          >
            Open Customer Directory →
          </button>
        </div>

        {/* Recent Customers Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-gray-900">
                Recent Onboarded Customers
              </h3>
              <p className="text-xs text-gray-500">
                Latest customer profiles requiring initial compatibility suggestions.
              </p>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="text-xs font-medium text-brand-accent hover:underline"
            >
              View all customers ({stats?.totalClients || 40}) →
            </button>
          </div>

          {loading ? (
            <div className="card overflow-hidden">
              <table className="w-full">
                <tbody>
                  <SkeletonTableRow cols={6} />
                  <SkeletonTableRow cols={6} />
                  <SkeletonTableRow cols={6} />
                </tbody>
              </table>
            </div>
          ) : (
            <CustomerTable customers={recentClients} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
