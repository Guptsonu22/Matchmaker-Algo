import type { MatchSuggestion } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { VerificationBadge } from '@/components/common/Badge';
import { ScoreBreakdown } from './ScoreBreakdown';
import {
  getAge,
  formatINR,
  formatHeight,
  MARITAL_STATUS_LABEL,
  DIET_LABEL,
} from '@/utils/formatters';
import { getScoreColor, getScoreLabel } from '@/utils/scoreHelpers';
import clsx from 'clsx';

interface MatchCardProps {
  suggestion: MatchSuggestion;
  onSendMatch: (candidate: MatchSuggestion) => void;
  isSending?: boolean;
}

export function MatchCard({ suggestion, onSendMatch, isSending = false }: MatchCardProps) {
  const { candidate, score } = suggestion;
  const age = getAge(candidate.dob);
  const color = getScoreColor(score.total);
  const scoreBadgeBg = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    red: 'bg-red-50 text-red-800 border-red-200',
  }[color];

  return (
    <div className="card p-6 flex flex-col justify-between hover:border-gray-300 transition-all shadow-sm">
      <div className="space-y-4">
        {/* Top Header: Candidate Avatar + Score Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar
              seed={candidate.avatarSeed}
              gender={candidate.gender}
              name={candidate.fullName}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-semibold text-gray-900">
                  {candidate.fullName}
                </h3>
                <span className="text-xs text-gray-400">
                  ({candidate.gender === 'male' ? 'M' : 'F'})
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {age} yrs • {formatHeight(candidate.heightCm)} • {candidate.city}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <VerificationBadge status={candidate.verificationStatus} />
                <span className="text-[11px] text-gray-400">ID: {candidate.profileId}</span>
              </div>
            </div>
          </div>

          {/* Compatibility Score Pillar */}
          <div className={clsx('text-right px-3 py-2 rounded-xl border', scoreBadgeBg)}>
            <div className="text-2xl font-bold font-serif leading-none tracking-tight">
              {score.total}%
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
              {getScoreLabel(score.total)}
            </div>
          </div>
        </div>

        {/* Bio snippet */}
        {candidate.selfDescription && (
          <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded border border-gray-100 italic">
            "{candidate.selfDescription}"
          </p>
        )}

        {/* Key Quick Attributes */}
        <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-100 py-3">
          <div>
            <span className="text-gray-400 block text-[11px]">Profession & Income</span>
            <span className="font-medium text-gray-800 truncate block">
              {candidate.occupation} ({formatINR(candidate.annualIncomeINR)}/yr)
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Community & Diet</span>
            <span className="font-medium text-gray-800 truncate block">
              {candidate.religion} • {DIET_LABEL[candidate.diet]}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Education</span>
            <span className="font-medium text-gray-800 truncate block">
              {candidate.education} ({candidate.educationField || 'General'})
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Marital & Family</span>
            <span className="font-medium text-gray-800 truncate block">
              {MARITAL_STATUS_LABEL[candidate.maritalStatus]} • {candidate.familyType}
            </span>
          </div>
        </div>

        {/* Explainable Score Breakdown */}
        <div>
          <ScoreBreakdown dimensions={score.dimensions} totalScore={score.total} compact={true} />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Ranked by 7-dimension compatibility
        </span>
        <button
          type="button"
          onClick={() => onSendMatch(suggestion)}
          disabled={isSending}
          className="btn-primary text-xs py-2 px-4 shadow-sm"
        >
          {isSending ? 'Sending...' : 'Send Match Proposal →'}
        </button>
      </div>
    </div>
  );
}
