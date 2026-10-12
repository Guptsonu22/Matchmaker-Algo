import { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SkeletonTableRow } from '@/components/common/Skeleton';
import { customersApi } from '@/api/customers';
import type { Client, CustomerQueryParams } from '@/types';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  const [filters, setFilters] = useState<CustomerQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    gender: '',
    status: '',
    religion: '',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customersApi.list(filters);
      setCustomers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFilterChange = (newFilters: CustomerQueryParams) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      gender: '',
      status: '',
      religion: '',
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <AppShell
      title="Customer Directory"
      subtitle="Search, filter, and review active matrimony clients managed by your team."
    >
      <div className="space-y-6">
        {/* Filters & Search Component */}
        <CustomerFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Error handling */}
        {error ? <ErrorMessage error={error} onRetry={fetchCustomers} /> : null}

        {/* Table / Skeleton / Empty state */}
        {loading ? (
          <div className="card overflow-hidden">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={7} />
                ))}
              </tbody>
            </table>
          </div>
        ) : customers.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No Customers Match Your Criteria"
              description="Try adjusting your search terms, gender, religion, or journey status filters."
              action={
                <button onClick={handleResetFilters} className="btn-secondary text-xs">
                  Reset Filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <CustomerTable customers={customers} />
            <Pagination
              page={filters.page || 1}
              totalPages={totalPages}
              total={total}
              limit={filters.limit || 10}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
