import React from 'react';
import type { CustomerQueryParams, Gender, JourneyStatus, Religion } from '@/types';
import { GENDER_LABEL, JOURNEY_STATUS_LABEL, RELIGION_LABEL } from '@/utils/formatters';

interface CustomerFiltersProps {
  filters: CustomerQueryParams;
  onChange: (newFilters: CustomerQueryParams) => void;
  onReset: () => void;
}

export function CustomerFilters({ filters, onChange, onReset }: CustomerFiltersProps) {
  const handleChange = (key: keyof CustomerQueryParams, value: any) => {
    onChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      page: 1, // reset page on filter change
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.gender || filters.status || filters.religion
  );

  return (
    <div className="card p-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="label-base">
            Search Customers
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Name, city, ID, or profession..."
              className="input-base pl-9"
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label htmlFor="gender" className="label-base">
            Gender
          </label>
          <select
            id="gender"
            className="input-base"
            value={filters.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value as Gender)}
          >
            <option value="">All Genders</option>
            {Object.entries(GENDER_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Journey Status */}
        <div>
          <label htmlFor="status" className="label-base">
            Journey Status
          </label>
          <select
            id="status"
            className="input-base"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value as JourneyStatus)}
          >
            <option value="">All Statuses</option>
            {Object.entries(JOURNEY_STATUS_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Religion */}
        <div>
          <label htmlFor="religion" className="label-base">
            Religion
          </label>
          <select
            id="religion"
            className="input-base"
            value={filters.religion || ''}
            onChange={(e) => handleChange('religion', e.target.value as Religion)}
          >
            <option value="">All Religions</option>
            {Object.entries(RELIGION_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Filter status bar */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="text-gray-500">Filtered view active</span>
          <button
            type="button"
            onClick={onReset}
            className="font-medium text-brand-accent hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
