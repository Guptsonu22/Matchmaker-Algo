import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { customersApi } from '@/api/customers';
import { matchesApi } from '@/api/matches';
import type { Client, MatchSuggestion, ScoreDimensions } from '@/types';
import { MatchCard } from '@/components/matches/MatchCard';
import { SendMatchModal } from '@/components/matches/SendMatchModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SkeletonCard } from '@/components/common/Skeleton';
import { useToast } from '@/components/common/Toast';
import { DIMENSION_LABELS } from '@/utils/scoreHelpers';

export function MatchSuggestionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState<Client | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  // Selected suggestion for the send modal
  const [selectedSuggestion, setSelectedSuggestion] = useState<MatchSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort and filter dimension control
  const [sortBy, setSortBy] = useState<string>('total');
  const [minScore, setMinScore] = useState<number>(50);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [cust, sugg] = await Promise.all([
        customersApi.getById(id),
        matchesApi.getSuggestions(id),
      ]);
      setCustomer(cust);
      setSuggestions(sugg);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle open modal
  const handleOpenSendModal = (sugg: MatchSuggestion) => {
    setSelectedSuggestion(sugg);
    setIsModalOpen(true);
  };

  // Handle confirm sending match
  const handleConfirmSend = async () => {
    if (!customer || !selectedSuggestion) return;
    try {
      await matchesApi.sendMatch(customer._id, selectedSuggestion.candidate._id);
      showToast(
        'success',
        'Match Proposal Dispatched',
        `Personalized introduction and proposal recorded for ${selectedSuggestion.candidate.fullName}.`
      );
      // Refresh suggestions to reflect any state changes
      fetchData();
    } catch (err) {
      showToast('error', 'Failed to Send Match', 'Please check server logs and retry.');
      throw err;
    }
  };

  // Filtered and sorted suggestions list
  const filteredSuggestions = useMemo(() => {
    return suggestions
      .filter((s) => s.score.total >= minScore)
      .sort((a, b) => {
        if (sortBy === 'total') {
          return b.score.total - a.score.total;
        }
        const dimKey = sortBy as keyof ScoreDimensions;
        const valA = a.score.dimensions[dimKey] || 0;
        const valB = b.score.dimensions[dimKey] || 0;
        return valB - valA;
      });
  }, [suggestions, minScore, sortBy]);

  return (
    <AppShell
      title={customer ? `Match Recommendations for ${customer.fullName}` : 'Match Recommendations'}
      subtitle={
        customer
          ? `Searching opposite-gender candidates against ${customer.gender === 'male' ? "bride" : "groom"} preferences.`
          : 'Loading suggestions...'
      }
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(customer ? `/customers/${customer._id}` : '/customers')}
            className="btn-ghost text-xs p-0 text-gray-500 hover:text-gray-800"
          >
            ← Back to Customer Profile
          </button>
          <div className="text-xs text-gray-500">
            Pool evaluated: <strong className="text-gray-900 font-semibold">{suggestions.length} Candidates</strong>
          </div>
        </div>

        {/* Filters and Re-ranking Toolbar */}
        <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-4 text-xs w-full sm:w-auto">
            {/* Sort by dimension */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-gray-500 font-medium">
                Prioritize Dimension:
              </label>
              <select
                id="sort-by"
                className="input-base text-xs py-1.5 px-3 w-44"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="total">Overall Match Score</option>
                {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min compatibility threshold */}
            <div className="flex items-center gap-2">
              <label htmlFor="min-score" className="text-gray-500 font-medium">
                Min Fit:
              </label>
              <select
                id="min-score"
                className="input-base text-xs py-1.5 px-3 w-28"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              >
                <option value={0}>All Scores</option>
                <option value={50}>50% and above</option>
                <option value={65}>65% and above</option>
                <option value={80}>80% (High fit only)</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-gray-400">
            Showing {filteredSuggestions.length} candidates
          </span>
        </div>

        {/* Error State */}
        {error && <ErrorMessage error={error} onRetry={fetchData} />}

        {/* Suggestions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No Suitable Matches Found"
              description="No opposite-gender profiles met your current compatibility threshold. Try lowering the minimum match filter or broadening customer preferences."
              action={
                <button
                  onClick={() => {
                    setMinScore(0);
                    setSortBy('total');
                  }}
                  className="btn-secondary text-xs"
                >
                  Reset Filter Threshold
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuggestions.map((suggestion) => (
              <MatchCard
                key={suggestion.candidate._id}
                suggestion={suggestion}
                onSendMatch={handleOpenSendModal}
              />
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {customer && (
          <SendMatchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            client={customer}
            suggestion={selectedSuggestion}
            onConfirm={handleConfirmSend}
          />
        )}
      </div>
    </AppShell>
  );
}
