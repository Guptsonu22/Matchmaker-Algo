import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { customersApi } from '@/api/customers';
import { matchesApi } from '@/api/matches';
import type { Client, MatcherNote, MatchEvent, JourneyStatus } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { JourneyBadge, VerificationBadge } from '@/components/common/Badge';
import { BiodataPanel } from '@/components/customers/BiodataPanel';
import { PreferencePanel } from '@/components/customers/PreferencePanel';
import { NotesPanel } from '@/components/customers/NotesPanel';
import { MatchHistoryTable } from '@/components/matches/MatchHistoryTable';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SkeletonText } from '@/components/common/Skeleton';
import { useToast } from '@/components/common/Toast';
import { getAge, JOURNEY_STATUS_LABEL } from '@/utils/formatters';
import clsx from 'clsx';

type Tab = 'biodata' | 'preferences' | 'notes' | 'history';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('biodata');
  const [customer, setCustomer] = useState<Client | null>(null);
  const [notes, setNotes] = useState<MatcherNote[]>([]);
  const [history, setHistory] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  const fetchCustomerDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [cust, nts, hist] = await Promise.all([
        customersApi.getById(id),
        customersApi.getNotes(id).catch(() => []),
        matchesApi.getHistory(id).catch(() => []),
      ]);
      setCustomer(cust);
      setNotes(nts);
      setHistory(hist);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // Handle Journey Status Change
  const handleStatusChange = async (newStatus: JourneyStatus) => {
    if (!customer) return;
    try {
      const updated = await customersApi.updateStatus(customer._id, newStatus);
      setCustomer(updated);
      showToast('success', 'Journey Status Updated', `Status is now ${JOURNEY_STATUS_LABEL[newStatus]}`);
    } catch (err) {
      showToast('error', 'Status Update Failed', 'Could not update client journey state.');
    }
  };

  // Handle Note Creation
  const handleAddNote = async (noteText: string) => {
    if (!customer) return;
    try {
      const created = await customersApi.addNote(customer._id, noteText);
      setNotes((prev) => [created, ...prev]);
      showToast('success', 'Note Logged', 'Matchmaker note has been recorded.');
    } catch (err) {
      showToast('error', 'Failed to Add Note');
    }
  };

  // Handle Note Deletion
  const handleDeleteNote = async (noteId: string) => {
    if (!customer) return;
    try {
      await customersApi.deleteNote(customer._id, noteId);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      showToast('info', 'Note Removed');
    } catch (err) {
      showToast('error', 'Failed to delete note');
    }
  };

  if (loading) {
    return (
      <AppShell title="Customer Profile">
        <div className="card p-8 space-y-4">
          <SkeletonText rows={4} />
        </div>
      </AppShell>
    );
  }

  if (error || !customer) {
    return (
      <AppShell title="Customer Profile">
        <ErrorMessage
          error={error || new Error('Customer profile not found')}
          onRetry={fetchCustomerDetails}
        />
      </AppShell>
    );
  }

  const age = getAge(customer.dob);

  return (
    <AppShell
      title={customer.fullName}
      subtitle={`ID: ${customer.profileId} • ${customer.city}, ${customer.state}`}
    >
      <div className="space-y-6">
        {/* Top Profile Header Card */}
        <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              seed={customer.avatarSeed}
              gender={customer.gender}
              name={customer.fullName}
              size="xl"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-gray-900">
                  {customer.fullName}
                </h2>
                <JourneyBadge status={customer.journeyStatus} />
                <VerificationBadge status={customer.verificationStatus} />
              </div>
              <p className="text-xs text-gray-500">
                {age} yrs • {customer.gender === 'male' ? 'Male' : 'Female'} • {customer.religion} ({customer.caste || 'Caste Open'})
              </p>
              <p className="text-xs text-gray-500">
                {customer.occupation} • {customer.city}
              </p>
            </div>
          </div>

          {/* Quick Actions & Status Control */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="journey-status" className="block text-[11px] font-medium text-gray-400 mb-1">
                Journey Stage
              </label>
              <select
                id="journey-status"
                className="input-base text-xs py-1.5 px-3"
                value={customer.journeyStatus}
                onChange={(e) => handleStatusChange(e.target.value as JourneyStatus)}
              >
                {Object.entries(JOURNEY_STATUS_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate(`/customers/${customer._id}/matches`)}
                className="btn-primary text-xs py-2 px-4 shadow-sm"
              >
                Find Recommended Matches →
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'biodata', label: 'Complete Biodata', count: null },
              { id: 'preferences', label: 'Partner Preferences', count: null },
              { id: 'notes', label: 'Matchmaker Notes', count: notes.length },
              { id: 'history', label: 'Sent Match History', count: history.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={clsx(
                  'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs transition-colors flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-brand-accent text-brand-accent font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px]',
                      activeTab === tab.id
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div>
          {activeTab === 'biodata' && <BiodataPanel customer={customer} />}
          {activeTab === 'preferences' && (
            <PreferencePanel preferences={customer.preferences} />
          )}
          {activeTab === 'notes' && (
            <NotesPanel
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
          {activeTab === 'history' && (
            <MatchHistoryTable
              history={history}
              onStatusUpdate={(updated) =>
                setHistory((prev) =>
                  prev.map((e) => (e._id === updated._id ? updated : e))
                )
              }
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
