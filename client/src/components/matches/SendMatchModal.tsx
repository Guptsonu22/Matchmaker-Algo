import { useState, useEffect, useCallback } from 'react';
import type { Client, MatchSuggestion, AIMatchIntroResponse, MatchEvent } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Avatar } from '@/components/common/Avatar';
import { aiApi } from '@/api/ai';
import {
  getAge,
  formatINR,
  formatHeight,
  formatDateTime,
  MARITAL_STATUS_LABEL,
  extractErrorMessage,
} from '@/utils/formatters';

interface SendMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  suggestion: MatchSuggestion | null;
  initialDraft?: string;
  onConfirm: (options?: {
    customIntroduction?: string;
    notes?: string;
    consentApproved?: boolean;
  }) => Promise<MatchEvent | void>;
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
  const [consentApproved, setConsentApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Result state after confirmation
  const [sentSuccessResult, setSentSuccessResult] = useState<MatchEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to count words
  const wordCount = draftIntro.trim() ? draftIntro.trim().split(/\s+/).filter(Boolean).length : 0;

  const fetchIntroduction = useCallback(
    async (forceRegenerate = false) => {
      if (!suggestion || !client) return;

      if (initialDraft && !forceRegenerate && !draftIntro) {
        setDraftIntro(initialDraft);
        setOriginalGeneratedIntro(initialDraft);
        return;
      }

      try {
        setIsGenerating(true);
        setErrorMessage(null);
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

  // Reset/initialize modal state
  useEffect(() => {
    if (isOpen && suggestion) {
      setSentSuccessResult(null);
      setErrorMessage(null);
      setConsentApproved(false);
      setNotes('');
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
      setSentSuccessResult(null);
      setErrorMessage(null);
      setConsentApproved(false);
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
    if (!consentApproved) {
      setErrorMessage('Client profile sharing consent and approval must be confirmed.');
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage(null);

      const result = await onConfirm({
        customIntroduction: draftIntro,
        notes,
        consentApproved: true,
      });

      // Display success only after backend confirms the operation
      if (result) {
        setSentSuccessResult(result);
      } else {
        // Fallback result object if onConfirm did not return the event
        setSentSuccessResult({
          _id: 'dispatched',
          clientId: client._id,
          candidateId: candidate._id,
          sentBy: '',
          sentAt: new Date().toISOString(),
          status: 'intro_sent',
          scoreSnapshot: score,
          aiIntroduction: draftIntro,
          emailDelivered: true,
          emailLog: '[Mock Delivery Adapter] Simulated delivery event recorded in demo mode.',
        });
      }
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to dispatch match proposal. Please retry.');
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const hasModifications = draftIntro !== originalGeneratedIntro && originalGeneratedIntro !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        sentSuccessResult
          ? 'Match Proposal Confirmed'
          : `Send Match: ${candidate.fullName} (${score.total}% Match)`
      }
      size="xl"
      footer={
        sentSuccessResult ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <span>✓</span> Introduction recorded • Mock email queued
            </span>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary text-xs py-2 px-5"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="text-[11px] text-gray-500">
              {wordCount} words •{' '}
              {wordCount >= 60 && wordCount <= 100 ? (
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
                disabled={isSending || isGenerating || !consentApproved || !draftIntro.trim()}
                className={`btn-primary text-xs flex items-center gap-1.5 ${
                  !consentApproved ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title={
                  !consentApproved
                    ? 'Please review and confirm client consent below before dispatching'
                    : 'Dispatch match proposal'
                }
              >
                {isSending ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    <span>Queuing Mock Delivery...</span>
                  </>
                ) : (
                  'Confirm & Send Match'
                )}
              </button>
            </div>
          </div>
        )
      }
    >
      {/* ── SUCCESS STATE VIEW (Confirmed by Backend) ── */}
      {sentSuccessResult ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xl mx-auto shadow-xs">
              ✓
            </div>
            <h3 className="font-serif font-semibold text-emerald-900 text-base">
              Introduction Recorded & Match Proposal Dispatched
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              The personalized introduction for <strong>{candidate.fullName}</strong> was recorded
              and the match stage is updated to <strong>Intro Sent</strong>.
            </p>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white border border-emerald-200 text-[11px] text-emerald-800 font-mono">
              <span>🕒 Queued:</span>
              <span>{formatDateTime(sentSuccessResult.sentAt || new Date())}</span>
            </div>
          </div>

          {/* Delivery Adapter Audit Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <span>📬</span>
                <span>Delivery Adapter Audit (Demo Mode)</span>
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                Simulated Delivery Event
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              In demo mode, delivery is processed through the{' '}
              <strong>MockDeliveryAdapter</strong>. A simulated delivery event was logged without
              transmitting real third-party emails.
            </p>
            {sentSuccessResult.deliveryReceipt?.messageId && (
              <p className="text-[11px] text-slate-500 font-mono">
                Message ID: {sentSuccessResult.deliveryReceipt.messageId}
              </p>
            )}
          </div>

          {/* Saved Introduction Preview */}
          <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 space-y-1.5 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Recorded Introduction Text:
            </span>
            <div className="p-3 bg-white rounded border border-gray-200 whitespace-pre-wrap font-serif text-[11px] leading-relaxed text-gray-800">
              {sentSuccessResult.aiIntroduction}
            </div>
          </div>
        </div>
      ) : (
        /* ── PRE-DISPATCH WORKFLOW VIEW ── */
        <div className="space-y-5">
          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-900 flex items-start justify-between gap-3 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-semibold block">⚠️ Dispatch Failed</span>
                <p className="text-[11px] text-rose-800">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="btn-secondary text-[11px] py-1 px-3 bg-white border-rose-300 text-rose-800 hover:bg-rose-50 whitespace-nowrap"
              >
                Retry Dispatch
              </button>
            </div>
          )}

          {/* Candidate Snapshot Pillar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate Side (Focus) */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/25 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  seed={candidate.avatarSeed}
                  gender={candidate.gender}
                  name={candidate.fullName}
                  size="md"
                />
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 block">
                    Candidate Profile • {score.total}% Compatibility
                  </span>
                  <h4 className="font-serif font-semibold text-gray-900 text-sm">
                    {candidate.fullName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {candidateAge} yrs • {candidate.city} • {formatHeight(candidate.heightCm)}
                  </p>
                </div>
              </div>
              <div className="text-xs space-y-1 text-gray-600 border-t border-rose-100 pt-2">
                <p><strong>Education:</strong> {candidate.education} ({candidate.educationField || 'General'})</p>
                <p><strong>Occupation:</strong> {candidate.occupation}</p>
                <p><strong>Income:</strong> {formatINR(candidate.annualIncomeINR)}/yr</p>
                <p><strong>Marital Status:</strong> {MARITAL_STATUS_LABEL[candidate.maritalStatus]}</p>
              </div>
            </div>

            {/* Client Context Side */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  seed={client.avatarSeed}
                  gender={client.gender}
                  name={client.fullName}
                  size="md"
                />
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-accent block">
                    Recipient Client
                  </span>
                  <h4 className="font-serif font-semibold text-gray-900 text-sm">
                    {client.fullName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {clientAge} yrs • {client.city} • {formatHeight(client.heightCm)}
                  </p>
                </div>
              </div>
              <div className="text-xs space-y-1 text-gray-600 border-t border-gray-100 pt-2">
                <p><strong>Education:</strong> {client.education} ({client.educationField || 'General'})</p>
                <p><strong>Occupation:</strong> {client.occupation}</p>
                <p><strong>Income:</strong> {formatINR(client.annualIncomeINR)}/yr</p>
                <p><strong>Marital Status:</strong> {MARITAL_STATUS_LABEL[client.maritalStatus]}</p>
              </div>
            </div>
          </div>

          {/* ── AI Assisted Introduction Preview & Editable Draft ── */}
          <div className="card p-4 space-y-3 bg-gradient-to-b from-slate-50/80 to-white border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Introduction Preview & Editable Draft
                </h4>
                {introMeta?.source === 'ai' && (
                  <span className="inline-flex items-center text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                    ✨ AI Assisted
                  </span>
                )}
                {introMeta?.source === 'fallback' && (
                  <span className="inline-flex items-center text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    📋 Curated Fallback
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
                    Revert
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
                  <span>{isGenerating ? 'Drafting...' : 'Regenerate'}</span>
                </button>
              </div>
            </div>

            {/* Editable Draft Textarea */}
            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-lg">
                  <div className="inline-block animate-spin text-xl mb-1">✨</div>
                  <span className="text-xs font-medium text-slate-700">
                    Drafting personalized introduction...
                  </span>
                </div>
              )}
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
                ✍️ Matchmakers can polish or tailor this message before confirming.
              </span>
              <span className="text-gray-400 font-mono">
                {draftIntro.length} chars • {wordCount} words
              </span>
            </div>
          </div>

          {/* Internal Matchmaker Operational Notes */}
          <div className="space-y-1">
            <label htmlFor="modal-notes" className="text-xs font-medium text-gray-700">
              Operational Matchmaker Notes (Optional)
            </label>
            <input
              id="modal-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Recommended based on mutual preference for metro lifestyle and career goals."
              className="input-base text-xs py-1.5 px-3 w-full"
            />
          </div>

          {/* ── MANDATORY CONSENT & APPROVAL CHECKPOINT ── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-start gap-3">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={consentApproved}
                onChange={(e) => setConsentApproved(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <label
                htmlFor="consent-checkbox"
                className="text-xs text-amber-950 font-medium leading-relaxed cursor-pointer select-none"
              >
                <strong>Client Profile Sharing Approval & Data Privacy Consent:</strong>
                <span className="block text-[11px] text-amber-900 font-normal mt-0.5">
                  I confirm that the client has authorized profile sharing, and I have verified that
                  this introduction shares only appropriate, non-confidential biodata. Sensitive
                  contact details, caste, and religion have not been disclosed.
                </span>
              </label>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>ℹ️</span>
              <span>
                <strong>Demo Mode Active:</strong> Dispatch will be processed by the Mock Email
                Adapter. Delivery event will be recorded as a simulated event without sending live
                emails.
              </span>
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
