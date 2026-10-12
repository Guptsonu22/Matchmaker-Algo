import type { ScoreDimensions } from '@/types';

export const DIMENSION_LABELS: Record<keyof ScoreDimensions, string> = {
  ageCompatibility: 'Age Compatibility',
  locationMatch: 'Location',
  educationAlignment: 'Education',
  incomeAlignment: 'Income',
  lifestyleHarmony: 'Lifestyle',
  culturalFit: 'Cultural Fit',
  preferenceReciprocity: 'Reciprocity',
};

export const DIMENSION_MAX: Record<keyof ScoreDimensions, number> = {
  ageCompatibility: 15,
  locationMatch: 10,
  educationAlignment: 12,
  incomeAlignment: 13,
  lifestyleHarmony: 15,
  culturalFit: 20,
  preferenceReciprocity: 15,
};

export const DIMENSION_ICONS: Record<keyof ScoreDimensions, string> = {
  ageCompatibility: '🎂',
  locationMatch: '📍',
  educationAlignment: '🎓',
  incomeAlignment: '💼',
  lifestyleHarmony: '🌿',
  culturalFit: '🪔',
  preferenceReciprocity: '🤝',
};

export function getScoreColor(score: number): string {
  if (score >= 80) return 'emerald';
  if (score >= 65) return 'amber';
  if (score >= 50) return 'orange';
  return 'red';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 65) return 'Good Match';
  if (score >= 50) return 'Fair Match';
  return 'Low Compatibility';
}

export function getDimensionPercent(dim: keyof ScoreDimensions, value: number): number {
  return Math.round((value / DIMENSION_MAX[dim]) * 100);
}

export function sortedDimensions(
  dimensions: ScoreDimensions,
): Array<{ key: keyof ScoreDimensions; value: number; pct: number }> {
  return (Object.keys(dimensions) as Array<keyof ScoreDimensions>)
    .map((key) => ({
      key,
      value: dimensions[key],
      pct: getDimensionPercent(key, dimensions[key]),
    }))
    .sort((a, b) => b.pct - a.pct);
}
