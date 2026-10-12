export const DIMENSION_LABELS: Record<string, string> = {
  mutualAge: 'Mutual Age Compatibility',
  children: 'Children & Family Planning',
  relocation: 'Relocation & Cities',
  career: 'Career & Professional',
  education: 'Education Alignment',
  lifestyle: 'Lifestyle & Shared Values',
  height: 'Height Preference',
  income: 'Income Alignment',
  ageCompatibility: 'Age Compatibility',
  locationMatch: 'Location',
  educationAlignment: 'Education',
  incomeAlignment: 'Income',
  lifestyleHarmony: 'Lifestyle',
  culturalFit: 'Cultural Fit',
  preferenceReciprocity: 'Reciprocity',
};

export const DIMENSION_MAX: Record<string, number> = {
  mutualAge: 18,
  children: 18,
  relocation: 16,
  career: 14,
  education: 14,
  lifestyle: 12,
  height: 4,
  income: 4,
  ageCompatibility: 15,
  locationMatch: 10,
  educationAlignment: 12,
  incomeAlignment: 13,
  lifestyleHarmony: 15,
  culturalFit: 20,
  preferenceReciprocity: 15,
};

export const DIMENSION_ICONS: Record<string, string> = {
  mutualAge: '🎂',
  children: '👶',
  relocation: '📍',
  career: '💼',
  education: '🎓',
  lifestyle: '🌿',
  height: '📏',
  income: '💰',
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

export function getDimensionPercent(dim: string, value: number): number {
  const max = DIMENSION_MAX[dim] || 15;
  return Math.min(100, Math.round((value / max) * 100));
}

export function sortedDimensions(
  dimensions: Record<string, number>,
): Array<{ key: string; value: number; pct: number }> {
  return Object.keys(dimensions)
    .filter((key) => typeof dimensions[key] === 'number' && dimensions[key] !== undefined)
    .map((key) => ({
      key,
      value: dimensions[key],
      pct: getDimensionPercent(key, dimensions[key]),
    }))
    .sort((a, b) => b.pct - a.pct);
}
