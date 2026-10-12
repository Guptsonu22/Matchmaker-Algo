import { useState } from 'react';
import type { ScoreDimensions } from '@/types';
import { ScoreBar } from '@/components/common/ScoreBar';
import {
  DIMENSION_LABELS,
  DIMENSION_MAX,
  DIMENSION_ICONS,
  sortedDimensions,
} from '@/utils/scoreHelpers';

interface ScoreBreakdownProps {
  dimensions: ScoreDimensions;
  totalScore: number;
  compact?: boolean;
}

export function ScoreBreakdown({ dimensions, compact = false }: ScoreBreakdownProps) {
  const [expanded, setExpanded] = useState(!compact);
  const sorted = sortedDimensions(dimensions);

  return (
    <div className="space-y-3">
      {compact && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-brand-accent hover:underline flex items-center gap-1 font-medium"
          >
            <span>{expanded ? 'Hide Score Breakdown ▲' : 'View Scoring Rationale ▼'}</span>
          </button>
        </div>
      )}

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50/75 rounded-lg border border-gray-100">
          {sorted.map(({ key, value }) => (
            <ScoreBar
              key={key}
              label={DIMENSION_LABELS[key]}
              value={value}
              max={DIMENSION_MAX[key]}
              icon={DIMENSION_ICONS[key]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
