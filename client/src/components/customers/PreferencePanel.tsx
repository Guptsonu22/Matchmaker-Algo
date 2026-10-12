import type { PartnerPreferences } from '@/types';
import {
  formatINR,
  formatHeight,
  EDUCATION_LABEL,
  DIET_LABEL,
  MARITAL_STATUS_LABEL,
} from '@/utils/formatters';

interface PreferencePanelProps {
  preferences: PartnerPreferences;
}

export function PreferencePanel({ preferences }: PreferencePanelProps) {
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base font-serif font-semibold text-gray-900">
            Partner Expectations & Preferences
          </h3>
          <p className="text-xs text-gray-500">
            Criteria used by the matchmaking engine to score opposite-gender candidate compatibility.
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          Flexibility: {Math.round(preferences.flexibilityScore * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        {/* Age Range */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Target Age Range</dt>
          <dd className="text-base font-semibold text-gray-900">
            {preferences.ageMin} – {preferences.ageMax} years
          </dd>
        </div>

        {/* Height Range */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Height Range</dt>
          <dd className="text-base font-semibold text-gray-900">
            {formatHeight(preferences.heightMinCm)} – {formatHeight(preferences.heightMaxCm)}
          </dd>
        </div>

        {/* Minimum Income */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Minimum Income</dt>
          <dd className="text-base font-semibold text-emerald-700">
            {preferences.incomeMinINR > 0
              ? `${formatINR(preferences.incomeMinINR)} / yr`
              : 'No minimum bar'}
          </dd>
        </div>

        {/* Education Min */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Education Min Requirement</dt>
          <dd className="font-semibold text-gray-900">
            {EDUCATION_LABEL[preferences.educationMin] || 'Open to all'}
          </dd>
        </div>

        {/* Religion Acceptance */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Accepted Religions</dt>
          <dd className="font-medium text-gray-900">
            {preferences.religionAccepted && preferences.religionAccepted.length > 0
              ? preferences.religionAccepted.join(', ')
              : 'All Religions'}
          </dd>
          <div className="mt-1 text-xs text-gray-500">
            Caste preference: {preferences.casteNoBar ? 'Caste No Bar' : 'Same Caste Preferred'}
          </div>
        </div>

        {/* Dietary Habits */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Acceptable Diet</dt>
          <dd className="font-medium text-gray-900">
            {preferences.diet && preferences.diet.length > 0
              ? preferences.diet.map((d) => DIET_LABEL[d] || d).join(', ')
              : 'Any Diet'}
          </dd>
        </div>

        {/* Preferred Locations */}
        <div className="col-span-full rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Preferred Locations</dt>
          <dd className="flex flex-wrap gap-1.5 mt-1">
            {preferences.locationPreference && preferences.locationPreference.length > 0 ? (
              preferences.locationPreference.map((loc, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  📍 {loc}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Open to any location</span>
            )}
          </dd>
        </div>

        {/* Marital Status Accepted */}
        <div className="col-span-full rounded-lg border border-gray-100 p-4 bg-gray-50/50">
          <dt className="text-xs text-gray-500 font-medium mb-1">Acceptable Marital Status</dt>
          <dd className="flex flex-wrap gap-2 mt-1">
            {preferences.maritalStatusAccepted && preferences.maritalStatusAccepted.length > 0 ? (
              preferences.maritalStatusAccepted.map((ms, i) => (
                <span
                  key={i}
                  className="rounded bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-700 font-medium"
                >
                  {MARITAL_STATUS_LABEL[ms] || ms}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Never Married Only</span>
            )}
          </dd>
        </div>
      </div>
    </div>
  );
}
