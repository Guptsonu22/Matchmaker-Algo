import { useState } from 'react';
import type { MatchEvent } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { ScoreBreakdown } from './ScoreBreakdown';

interface MatchHistoryTableProps {
  history: MatchEvent[];
}

export function MatchHistoryTable({ history }: MatchHistoryTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);

  if (history.length === 0) {
    return (
      <div className="card p-10 text-center">
        <span className="text-4xl block mb-2">📜</span>
        <h4 className="font-serif font-medium text-gray-800 text-base">No Matches Dispatched Yet</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
          When proposals are sent to this customer, their generated introductions and snapshots will be tracked here.
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
                <th className="px-4 py-3.5">Match Score</th>
                <th className="px-4 py-3.5">Matchmaker</th>
                <th className="px-4 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {history.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-700">
                    {formatDateTime(event.sentAt)}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">
                    {event.candidate?.fullName || 'Candidate Profile'}
                    <span className="block text-xs font-normal text-gray-400">
                      ID: {event.candidate?.profileId || event.candidateId}
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
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <span>✓</span> Mock Delivered
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Details Drawer/Card */}
      {selectedEvent && (
        <div className="card p-6 border-brand-accent/30 bg-rose-50/10 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-serif font-semibold text-gray-900 text-sm">
                Match Proposal Record • Sent {formatDateTime(selectedEvent.sentAt)}
              </h4>
              <p className="text-xs text-gray-500">
                Candidate: {selectedEvent.candidate?.fullName || selectedEvent.candidateId} • Compatibility Score: {selectedEvent.scoreSnapshot.total}%
              </p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close ✕
            </button>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Generated Introduction (AI or Curated)
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
