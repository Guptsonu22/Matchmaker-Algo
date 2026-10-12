import { useState } from 'react';
import type { Client, MatchSuggestion } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Avatar } from '@/components/common/Avatar';
import { getAge, formatINR, formatHeight, MARITAL_STATUS_LABEL } from '@/utils/formatters';

interface SendMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  suggestion: MatchSuggestion | null;
  onConfirm: () => Promise<void>;
}

export function SendMatchModal({
  isOpen,
  onClose,
  client,
  suggestion,
  onConfirm,
}: SendMatchModalProps) {
  const [loading, setLoading] = useState(false);

  if (!suggestion) return null;

  const { candidate, score } = suggestion;
  const clientAge = getAge(client.dob);
  const candidateAge = getAge(candidate.dob);

  const handleSend = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Match Proposal Dispatch"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="btn-primary text-xs"
          >
            {loading ? 'Generating AI Intro & Dispatching...' : 'Confirm & Send Match'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-xs text-gray-600">
          Review both profiles before generating a personalized introduction and logging mock email dispatch.
        </p>

        {/* Side by Side Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Side */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
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
              <p><strong>Occupation:</strong> {client.occupation}</p>
              <p><strong>Income:</strong> {formatINR(client.annualIncomeINR)}/yr</p>
              <p><strong>Community:</strong> {client.religion} ({client.caste || 'Open'})</p>
              <p><strong>Status:</strong> {MARITAL_STATUS_LABEL[client.maritalStatus]}</p>
            </div>
          </div>

          {/* Candidate Side */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 space-y-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                seed={candidate.avatarSeed}
                gender={candidate.gender}
                name={candidate.fullName}
                size="md"
              />
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700">
                  Match Candidate ({score.total}%)
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
              <p><strong>Occupation:</strong> {candidate.occupation}</p>
              <p><strong>Income:</strong> {formatINR(candidate.annualIncomeINR)}/yr</p>
              <p><strong>Community:</strong> {candidate.religion} ({candidate.caste || 'Open'})</p>
              <p><strong>Status:</strong> {MARITAL_STATUS_LABEL[candidate.maritalStatus]}</p>
            </div>
          </div>
        </div>

        {/* Introduction note */}
        <div className="rounded-lg bg-blue-50/70 p-3.5 border border-blue-100 text-xs text-blue-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <span>✨</span> Automated Introduction Engine
          </p>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            Upon confirmation, the system uses OpenAI to compose a professional, culturally thoughtful matrimonial introduction, saves the match record with the compatibility breakdown snapshot, and logs the mock email delivery.
          </p>
        </div>
      </div>
    </Modal>
  );
}
