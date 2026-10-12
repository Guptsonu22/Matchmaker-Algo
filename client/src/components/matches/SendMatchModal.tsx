import { useState, useEffect, useCallback } from 'react';
import type { Client, MatchSuggestion, AIMatchIntroResponse } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Avatar } from '@/components/common/Avatar';
import { aiApi } from '@/api/ai';
import { getAge, formatINR, formatHeight, MARITAL_STATUS_LABEL } from '@/utils/formatters';

interface SendMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  suggestion: MatchSuggestion | null;
  initialDraft?: string;
  onConfirm: (options?: { customIntroduction?: string; notes?: string }) => Promise<void>;
}

export function SendMatchModal({
  isOpen,
  onClose,
  client,
  suggestion,
  initialDraft,
  onConfirm,
}: SendMatchModalProps) {
  const [draftIntro, setDraftIntro] = useState<string>('');
  const [originalGeneratedIntro, setOriginalGeneratedIntro] = useState<string>('');
  const [introMeta, setIntroMeta] = useState<AIMatchIntroResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper to count words
  const wordCount = draftIntro.trim() ? draftIntro.trim().split(/\s+/).filter(Boolean).length : 0;

  const fetchIntroduction = useCallback(
    async (forceRegenerate = false) => {
      if (!suggestion || !client) return;

      // If an initial draft was provided and we aren't explicitly regenerating, use it
      if (initialDraft && !forceRegenerate && !draftIntro) {
        setDraftIntro(initialDraft);
        setOriginalGeneratedIntro(initialDraft);
        return;
      }

      try {
        setIsGenerating(true);
        const result = await aiApi.generateMatchIntroduction({
          customerId: client._id,
          candidateId: suggestion.candidate._id,
          score: suggestion.score,
          explanation: suggestion.explanation,
        });

        setDraftIntro(result.introduction);
        setOriginalGeneratedIntro(result.introduction);
        setIntroMeta(result);
      } catch (err) {
        console.error('Failed to generate introduction draft:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [client, suggestion, initialDraft, draftIntro]
  );

  // Load intro when modal opens with a new suggestion
  useEffect(() => {
    if (isOpen && suggestion) {
      if (initialDraft) {
        setDraftIntro(initialDraft);
        setOriginalGeneratedIntro(initialDraft);
      } else {
        fetchIntroduction();
      }
    } else {
      setDraftIntro('');
      setOriginalGeneratedIntro('');
      setIntroMeta(null);
      setNotes('');
      setCopied(false);
    }
  }, [isOpen, suggestion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!suggestion) return null;

  const { candidate, score } = suggestion;
  const clientAge = getAge(client.dob);
  const candidateAge = getAge(candidate.dob);

  const handleCopy = () => {
    if (!draftIntro) return;
    navigator.clipboard.writeText(draftIntro);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      await onConfirm({
        customIntroduction: draftIntro,
        notes,
      });
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const hasModifications = draftIntro !== originalGeneratedIntro && originalGeneratedIntro !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalized Match Proposal & AI Introduction"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-gray-500">
            {wordCount} words • {wordCount >= 60 && wordCount <= 100 ? (
              <span className="text-emerald-700 font-medium">Optimal length (60–100 words)</span>
            ) : (
              <span className="text-amber-700 font-medium">Recommended: 60–100 words</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || isGenerating}
              className="btn-primary text-xs"
            >
              {isSending ? 'Dispatching Match...' : 'Confirm & Send Match Proposal'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Side by Side Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Side */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Avatar
                seed={client.avatarSeed}
                gender={client.gender}
                name={client.fullName}
                size="md"
              />
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-accent">
                  Your Client
                </span>
                <h4 className="font-serif font-semibold text-gray-900 text-sm">
                  {client.fullName}
                </h4>
                <p className="text-xs text-gray-500">
                  {clientAge} yrs • {client.city}
                </p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-gray-600 border-t border-gray-100 pt-2">
              <p><strong>Height:</strong> {formatHeight(client.heightCm)}</p>
              <p><strong>Education:</strong> {client.education} ({client.educationField || 'General'})</p>
              <p><strong>Occupation:</strong> {client.occupation}</p>
              <p><strong>Income:</strong> {formatINR(client.annualIncomeINR)}/yr</p>
              <p><strong>Marital Status:</strong> {MARITAL_STATUS_LABEL[client.maritalStatus]}</p>
            </div>
          </div>

          {/* Candidate Side */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Avatar
                seed={candidate.avatarSeed}
                gender={candidate.gender}
                name={candidate.fullName}
                size="md"
              />
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700">
                  Match Candidate ({score.total}% Alignment)
                </span>
                <h4 className="font-serif font-semibold text-gray-900 text-sm">
                  {candidate.fullName}
                </h4>
                <p className="text-xs text-gray-500">
                  {candidateAge} yrs • {candidate.city}
                </p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-gray-600 border-t border-gray-100 pt-2">
              <p><strong>Height:</strong> {formatHeight(candidate.heightCm)}</p>
              <p><strong>Education:</strong> {candidate.education} ({candidate.educationField || 'General'})</p>
              <p><strong>Occupation:</strong> {candidate.occupation}</p>
              <p><strong>Income:</strong> {formatINR(candidate.annualIncomeINR)}/yr</p>
              <p><strong>Marital Status:</strong> {MARITAL_STATUS_LABEL[candidate.maritalStatus]}</p>
            </div>
          </div>
        </div>

        {/* ── AI Assisted Introduction Preview & Editable Draft ── */}
        <div className="card p-4 space-y-3 bg-gradient-to-b from-slate-50/80 to-white border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Personalized Introduction Preview
              </h4>
              {introMeta?.source === 'ai' && (
                <span className="inline-flex items-center text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  ✨ OpenAI Responses API
                </span>
              )}
              {introMeta?.source === 'fallback' && (
                <span
                  className="inline-flex items-center text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full"
                  title={
                    introMeta.fallbackReason === 'missing_api_key'
                      ? 'No OPENAI_API_KEY configured: using curated template'
                      : `Fallback activated: ${introMeta.fallbackReason}`
                  }
                >
                  📋 Curated Template Fallback
                </span>
              )}
            </div>

            {/* Action buttons: Regenerate & Copy & Reset */}
            <div className="flex items-center gap-1.5">
              {hasModifications && (
                <button
                  type="button"
                  onClick={() => setDraftIntro(originalGeneratedIntro)}
                  className="btn-ghost text-[11px] py-1 px-2 text-gray-500 hover:text-gray-800"
                  title="Revert edits to generated draft"
                >
                  Revert to original
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!draftIntro}
                className="btn-secondary text-[11px] py-1 px-2.5 text-gray-600"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => fetchIntroduction(true)}
                disabled={isGenerating || isSending}
                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 bg-white hover:bg-slate-50 border-slate-300 text-slate-800"
              >
                <span className={isGenerating ? 'animate-spin' : ''}>🔄</span>
                <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
              </button>
            </div>
          </div>

          {/* Editable Draft Textarea */}
          <div className="relative">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-lg">
                <div className="inline-block animate-spin text-xl mb-1">✨</div>
                <span className="text-xs font-medium text-slate-700">
                  Drafting warm, respectful introduction...
                </span>
              </div>
            )}
            <label htmlFor="intro-draft" className="sr-only">
              Editable Introduction Draft
            </label>
            <textarea
              id="intro-draft"
              rows={6}
              value={draftIntro}
              onChange={(e) => setDraftIntro(e.target.value)}
              placeholder="Click 'Regenerate' to draft a personalized introduction..."
              className="input-base text-xs font-serif leading-relaxed w-full p-3 resize-y bg-white border-slate-200 focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span className="italic">
              ✍️ Editable draft: You can polish or adjust wording before dispatching to the client.
            </span>
            <span className="text-gray-400 font-mono">
              {draftIntro.length} characters
            </span>
          </div>
        </div>

        {/* Optional Internal Operational Notes */}
        <div className="space-y-1">
          <label htmlFor="modal-notes" className="text-xs font-medium text-gray-700">
            Internal Matchmaker Notes (Optional)
          </label>
          <input
            id="modal-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Discussed with client on consultation call; highlight location flexibility."
            className="input-base text-xs py-1.5 px-3 w-full"
          />
        </div>

        {/* Privacy & Governance Notice */}
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span>🛡️</span> Privacy & Responsible AI Guidelines
          </p>
          <p className="leading-relaxed text-slate-600">
            The assistant crafts introductions using only verified biodata facts (education, profession, location, and verified hobbies). Private contact details, caste, and religion are strictly omitted. Compatibility score is presented as an alignment evaluation across partner criteria, never as a prediction of relationship success.
          </p>
        </div>
      </div>
    </Modal>
  );
}
