import { useState } from 'react';
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
  const { candidate, score, confidence, explanation, matchedCriteria, potentialConcerns } = suggestion;
  const [showWhyMatch, setShowWhyMatch] = useState(true);
  const age = getAge(candidate.dob);
  const color = getScoreColor(score.total);

  const scoreBadgeBg = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    red: 'bg-red-50 text-red-800 border-red-200',
  }[color];

  const confidenceColor =
    (confidence ?? 100) >= 80
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : (confidence ?? 100) >= 60
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="card p-6 flex flex-col justify-between hover:border-gray-300 transition-all shadow-sm">
      <div className="space-y-4">
        {/* Top Header: Candidate Avatar + Score & Confidence Badges */}
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
          <div className="flex flex-col items-end gap-1.5">
            <div className={clsx('text-right px-3.5 py-2 rounded-xl border', scoreBadgeBg)}>
              <div className="text-2xl font-bold font-serif leading-none tracking-tight">
                {score.total}%
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                {getScoreLabel(score.total)}
              </div>
            </div>
            {typeof confidence === 'number' && (
              <span
                className={clsx(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                  confidenceColor
                )}
                title="Penalized when essential partner criteria are missing in biodata"
              >
                {confidence}% Data Confidence
              </span>
            )}
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

        {/* ── Clear "Why this match?" Explanation Section ── */}
        <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/70 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Why this match?</span>
            </span>
            <button
              type="button"
              onClick={() => setShowWhyMatch(!showWhyMatch)}
              className="text-[11px] text-brand-accent hover:underline font-medium"
            >
              {showWhyMatch ? 'Collapse' : 'Expand Rationale'}
            </button>
          </div>

          {/* Quick Matched Criteria Tags */}
          {matchedCriteria && matchedCriteria.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {matchedCriteria.map((crit, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-100/70 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-medium"
                >
                  ✓ {crit}
                </span>
              ))}
            </div>
          )}

          {showWhyMatch && (
            <div className="space-y-2 pt-1 border-t border-slate-200/50">
              {/* Summary */}
              {explanation?.summary && (
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {explanation.summary}
                </p>
              )}

              {/* Positive Signals */}
              {explanation?.positiveSignals && explanation.positiveSignals.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Positive Signals:
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-slate-700 pl-3">
                    {explanation.positiveSignals.slice(0, 3).map((sig, i) => (
                      <li key={i} className="list-disc text-emerald-700 marker:text-emerald-500">
                        <span className="text-slate-700">{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Concerns / Considerations */}
              {potentialConcerns && potentialConcerns.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-200/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Considerations / Variations:
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-slate-700 pl-3">
                    {potentialConcerns.map((con, i) => (
                      <li key={i} className="list-disc text-amber-700 marker:text-amber-500">
                        <span className="text-slate-700">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Information Penalty Notice */}
              {explanation?.missingInformation && explanation.missingInformation.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-200/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Unspecified Data (penalized confidence):
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-slate-500 pl-3">
                    {explanation.missingInformation.slice(0, 2).map((msg, i) => (
                      <li key={i} className="list-disc text-slate-400 marker:text-slate-400">
                        <span>{msg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explainable Score Breakdown */}
        <div>
          <ScoreBreakdown dimensions={score.dimensions} totalScore={score.total} compact={true} />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Deterministic Compatibility Engine
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
