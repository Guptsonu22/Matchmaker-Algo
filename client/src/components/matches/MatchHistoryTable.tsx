import { useState } from 'react';
import type { MatchEvent, MatchStatus } from '@/types';
import { formatDateTime, MATCH_STATUS_LABEL, MATCH_STATUS_BADGE } from '@/utils/formatters';
import { ScoreBreakdown } from './ScoreBreakdown';
import { matchesApi } from '@/api/matches';
import { useToast } from '@/components/common/Toast';
import clsx from 'clsx';

interface MatchHistoryTableProps {
  history: MatchEvent[];
  onStatusUpdate?: (updatedEvent: MatchEvent) => void;
}

const STATUS_OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'intro_sent', label: 'Intro Sent' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export function MatchHistoryTable({ history: initialHistory, onStatusUpdate }: MatchHistoryTableProps) {
  const [historyList, setHistoryList] = useState<MatchEvent[]>(initialHistory);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Keep internal list synced with prop updates
  if (initialHistory !== historyList && initialHistory.length !== historyList.length) {
    setHistoryList(initialHistory);
  }

  const handleStatusChange = async (eventId: string, newStatus: MatchStatus) => {
    try {
      setUpdatingId(eventId);
      const updated = await matchesApi.updateStatus(eventId, newStatus);
      setHistoryList((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
      );
      if (selectedEvent?._id === eventId) {
        setSelectedEvent((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      onStatusUpdate?.(updated);
      showToast(
        'success',
        'Match Status Updated',
        `Proposal status moved to "${MATCH_STATUS_LABEL[newStatus] || newStatus}".`
      );
    } catch (err: any) {
      showToast(
        'error',
        'Failed to Update Status',
        err.response?.data?.message || err.message || 'Please retry.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (historyList.length === 0) {
    return (
      <div className="card p-10 text-center">
        <span className="text-4xl block mb-2">📜</span>
        <h4 className="font-serif font-medium text-gray-800 text-base">No Matches Dispatched Yet</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
          When proposals are sent to this customer, their generated introductions, mock delivery events, and lifecycle statuses will be tracked here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-brand-border bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Dispatched Date</th>
                <th className="px-4 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Compatibility</th>
                <th className="px-4 py-3.5">Matchmaker</th>
                <th className="px-4 py-3.5">Delivery Audit</th>
                <th className="px-4 py-3.5">Match Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {historyList.map((event) => {
                const candidateName =
                  event.candidate?.fullName ||
                  (typeof event.candidateId === 'object' && (event.candidateId as any)?.fullName) ||
                  'Candidate Profile';
                const candidateIdStr =
                  event.candidate?.profileId ||
                  (typeof event.candidateId === 'object'
                    ? (event.candidateId as any)?.profileId || (event.candidateId as any)?._id
                    : event.candidateId);

                return (
                  <tr key={event._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-700">
                      <div>
                        {formatDateTime(event.createdAt || event.sentAt)}
                      </div>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        {new Date(event.createdAt || event.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      <div>{candidateName}</div>
                      <span className="block text-xs font-normal text-gray-400 font-mono">
                        ID: {candidateIdStr}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {event.scoreSnapshot.total}% Fit
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {event.sentByName || 'Matchmaker'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {event.isMockDelivery ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <span className="text-emerald-500">✓</span> Mock email queued
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Demo adapter (simulated)
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium">
                          <span>✓</span> Introduction recorded
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={event.status}
                          disabled={updatingId === event._id}
                          onChange={(e) =>
                            handleStatusChange(event._id, e.target.value as MatchStatus)
                          }
                          className={clsx(
                            'text-xs font-semibold rounded-lg px-2.5 py-1 border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-accent',
                            MATCH_STATUS_BADGE[event.status] ||
                              'bg-gray-100 text-gray-700 border-gray-200',
                            updatingId === event._id && 'opacity-50 cursor-wait'
                          )}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEvent(selectedEvent?._id === event._id ? null : event)
                        }
                        className="text-xs font-medium text-brand-accent hover:underline"
                      >
                        {selectedEvent?._id === event._id ? 'Hide Details ▲' : 'View Intro & Score ▼'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Details Drawer/Card */}
      {selectedEvent && (
        <div className="card p-6 border-brand-accent/30 bg-rose-50/10 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-semibold text-gray-900 text-sm">
                  Match Proposal Record • Sent {formatDateTime(selectedEvent.createdAt || selectedEvent.sentAt)}
                </h4>
                <span
                  className={clsx(
                    'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                    MATCH_STATUS_BADGE[selectedEvent.status] ||
                      'bg-gray-100 text-gray-700 border-gray-200'
                  )}
                >
                  {MATCH_STATUS_LABEL[selectedEvent.status] || selectedEvent.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Acting Matchmaker: {selectedEvent.sentByName || 'Matchmaker'} • Compatibility Score: {selectedEvent.scoreSnapshot.total}%
              </p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close ✕
            </button>
          </div>

          {/* Delivery Audit Info Card */}
          <div className="rounded-lg bg-emerald-50/50 border border-emerald-200/70 p-3 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <span>📡</span>
                <span>Delivery Dispatch Audit</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded">
                Adapter: {selectedEvent.deliveryProvider || (selectedEvent.isMockDelivery ? 'mock_adapter' : 'standard')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              {selectedEvent.isMockDelivery
                ? 'Simulated delivery event recorded in system audit log. No real external email was sent to customer.'
                : 'Introduction dispatch confirmed and recorded by backend.'}
            </p>
            {selectedEvent.deliveryReceipt?.messageId && (
              <div className="pt-1 text-[10px] font-mono text-emerald-700">
                Receipt ID: {selectedEvent.deliveryReceipt.messageId} • Status: {selectedEvent.deliveryStatus || 'mock_delivered'}
              </div>
            )}
          </div>

          {/* Quick Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-600">Quick Update Status:</span>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={selectedEvent.status === opt.value || updatingId === selectedEvent._id}
                onClick={() => handleStatusChange(selectedEvent._id, opt.value)}
                className={clsx(
                  'text-xs py-1 px-2.5 rounded-lg border font-medium transition-all',
                  selectedEvent.status === opt.value
                    ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-default'
                    : 'bg-white hover:bg-slate-50 text-gray-700 border-gray-300 shadow-xs'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Personalized Introduction Dispatched
            </h5>
            <div className="p-4 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs font-sans">
              {selectedEvent.aiIntroduction || 'No introduction recorded.'}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Score Breakdown Snapshot at Dispatch
            </h5>
            <ScoreBreakdown
              dimensions={selectedEvent.scoreSnapshot.dimensions}
              totalScore={selectedEvent.scoreSnapshot.total}
              compact={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
