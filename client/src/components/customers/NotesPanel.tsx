import React, { useState } from 'react';
import type { MatcherNote } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface NotesPanelProps {
  notes: MatcherNote[];
  onAddNote: (note: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  isLoading?: boolean;
}

export function NotesPanel({ notes, onAddNote, onDeleteNote, isLoading }: NotesPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSubmitting(true);
      await onAddNote(newNote.trim());
      setNewNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-serif font-semibold text-gray-900">
            Internal Matchmaker Operational Notes
          </h3>
          <p className="text-xs text-gray-500">
            Confidential notes regarding family consultations, special requirements, and timeline expectations.
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium">{notes.length} notes recorded</span>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="new-note" className="label-base text-xs">
            Add New Matchmaker Log
          </label>
          <textarea
            id="new-note"
            rows={3}
            placeholder="Document preferences expressed during onboarding call, non-negotiable boundaries, or family dynamics..."
            className="input-base text-sm resize-none"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newNote.trim() || submitting}
            className="btn-primary text-xs py-2 px-4"
          >
            {submitting ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>

      {/* List of Notes */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="text-center py-6 text-sm text-gray-400">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            No notes logged for this customer yet. Use the field above to add the first log.
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n._id}
              className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 space-y-2 relative group"
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-accent inline-block" />
                  {n.authorName || 'Matchmaker Team'}
                </span>
                <span>{formatDateTime(n.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {n.note}
              </p>
              {onDeleteNote && (
                <button
                  type="button"
                  onClick={() => onDeleteNote(n._id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  title="Delete note"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
