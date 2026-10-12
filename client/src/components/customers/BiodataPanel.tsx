import type { Candidate } from '@/types';
import {
  getAge,
  formatINR,
  formatHeight,
  formatDate,
  MARITAL_STATUS_LABEL,
  DIET_LABEL,
  HABIT_LABEL,
  EDUCATION_LABEL,
  FAMILY_TYPE_LABEL,
  FAMILY_VALUES_LABEL,
} from '@/utils/formatters';

interface BiodataPanelProps {
  customer: Candidate;
}

export function BiodataPanel({ customer }: BiodataPanelProps) {
  const age = getAge(customer.dob);

  return (
    <div className="space-y-6">
      {/* Self Bio / Summary */}
      {customer.selfDescription && (
        <div className="card p-6">
          <h3 className="text-base font-serif font-semibold text-gray-900 mb-2">
            About {customer.fullName.split(' ')[0]}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed italic bg-amber-50/50 p-4 rounded-lg border border-amber-100">
            "{customer.selfDescription}"
          </p>
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic & Demographic Info */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">👤</span>
            <h4 className="font-medium text-gray-900">Personal Details</h4>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Date of Birth</dt>
              <dd className="font-medium text-gray-800">{formatDate(customer.dob)} ({age} yrs)</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Height</dt>
              <dd className="font-medium text-gray-800">{formatHeight(customer.heightCm)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Marital Status</dt>
              <dd className="font-medium text-gray-800">{MARITAL_STATUS_LABEL[customer.maritalStatus]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Mother Tongue</dt>
              <dd className="font-medium text-gray-800">{customer.motherTongue}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Current City</dt>
              <dd className="font-medium text-gray-800">{customer.city}, {customer.state}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Native Place</dt>
              <dd className="font-medium text-gray-800">{customer.nativePlace || 'Not Specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Religion & Astrology */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🪔</span>
            <h4 className="font-medium text-gray-900">Religion & Astrological</h4>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Religion</dt>
              <dd className="font-medium text-gray-800">{customer.religion}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Caste / Subcaste</dt>
              <dd className="font-medium text-gray-800">
                {customer.caste || 'Open'} {customer.subCaste ? `(${customer.subCaste})` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Manglik Status</dt>
              <dd className="font-medium text-gray-800">
                {customer.isManglik ? 'Manglik (Yes)' : 'Non-Manglik'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Rashi</dt>
              <dd className="font-medium text-gray-800">{customer.rashi || 'Not Specified'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Nakshatra</dt>
              <dd className="font-medium text-gray-800">{customer.nakshatra || 'Not Specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Education & Career */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🎓</span>
            <h4 className="font-medium text-gray-900">Education & Profession</h4>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Highest Education</dt>
              <dd className="font-medium text-gray-800">{EDUCATION_LABEL[customer.education]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Field of Study</dt>
              <dd className="font-medium text-gray-800">{customer.educationField || 'General'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Occupation</dt>
              <dd className="font-medium text-gray-800">{customer.occupation}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Employer / Org</dt>
              <dd className="font-medium text-gray-800">{customer.employer || 'Self-Employed'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-gray-400">Annual Income</dt>
              <dd className="text-base font-semibold text-emerald-700">
                {formatINR(customer.annualIncomeINR)} / annum
              </dd>
            </div>
          </dl>
        </div>

        {/* Family Details */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🏡</span>
            <h4 className="font-medium text-gray-900">Family Background</h4>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Family Type</dt>
              <dd className="font-medium text-gray-800">{FAMILY_TYPE_LABEL[customer.familyType]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Family Values</dt>
              <dd className="font-medium text-gray-800">{FAMILY_VALUES_LABEL[customer.familyValues]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Father's Occupation</dt>
              <dd className="font-medium text-gray-800">{customer.fatherOccupation || 'Retired'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Mother's Occupation</dt>
              <dd className="font-medium text-gray-800">{customer.motherOccupation || 'Homemaker'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Siblings</dt>
              <dd className="font-medium text-gray-800">{customer.numberOfSiblings} siblings</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Lifestyle & Hobbies */}
      <div className="card p-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <span className="text-lg">🌿</span>
          <h4 className="font-medium text-gray-900">Lifestyle & Interests</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Dietary Preference</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
              {DIET_LABEL[customer.diet]}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Smoking & Drinking</span>
            <span className="text-gray-700 font-medium">
              Smoking: {HABIT_LABEL[customer.smoking]} • Drinking: {HABIT_LABEL[customer.drinking]}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Hobbies & Activities</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {customer.hobbies && customer.hobbies.length > 0 ? (
                customer.hobbies.map((h, i) => (
                  <span
                    key={i}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {h}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">None listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
