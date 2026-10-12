import type {
  Diet,
  Education,
  FamilyType,
  FamilyValues,
  Gender,
  HabitLevel,
  JourneyStatus,
  MaritalStatus,
  Religion,
  VerificationStatus,
} from '@/types';

// ─── Date / Age ───────────────────────────────────────────────────────────────

export function getAge(dob: string | Date): number {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return 0;
  const diffMs = Date.now() - birth.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function formatDate(iso: string | Date, _fmt = 'dd MMM yyyy'): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | Date): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  if (amount >= 10_00_000) {
    return `₹${(amount / 10_00_000).toFixed(1)}L`;
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Height ───────────────────────────────────────────────────────────────────

export function formatHeight(cm: number): string {
  const totalIn = Math.round(cm / 2.54);
  const ft = Math.floor(totalIn / 12);
  const inches = totalIn % 12;
  return `${ft}'${inches}" (${cm} cm)`;
}

// ─── Enums → Labels ──────────────────────────────────────────────────────────

export const GENDER_LABEL: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
};

export const MARITAL_STATUS_LABEL: Record<MaritalStatus, string> = {
  never_married: 'Never Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  separated: 'Separated',
};

export const DIET_LABEL: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  non_vegetarian: 'Non-Vegetarian',
  eggetarian: 'Eggetarian',
  vegan: 'Vegan',
};

export const HABIT_LABEL: Record<HabitLevel, string> = {
  no: 'No',
  occasionally: 'Occasionally',
  yes: 'Yes',
};

export const EDUCATION_LABEL: Record<Education, string> = {
  HSC: 'HSC / 12th',
  Diploma: 'Diploma',
  Bachelors: "Bachelor's Degree",
  Masters: "Master's Degree",
  PhD: 'PhD / Doctorate',
  Other: 'Other',
};

export const FAMILY_TYPE_LABEL: Record<FamilyType, string> = {
  joint: 'Joint Family',
  nuclear: 'Nuclear Family',
  extended: 'Extended Family',
};

export const FAMILY_VALUES_LABEL: Record<FamilyValues, string> = {
  traditional: 'Traditional',
  moderate: 'Moderate',
  liberal: 'Liberal',
};

export const RELIGION_LABEL: Record<Religion, string> = {
  Hindu: 'Hindu',
  Muslim: 'Muslim',
  Christian: 'Christian',
  Sikh: 'Sikh',
  Jain: 'Jain',
  Buddhist: 'Buddhist',
  Other: 'Other',
};

export const JOURNEY_STATUS_LABEL: Record<JourneyStatus, string> = {
  new: 'New',
  active: 'Active',
  matched: 'Matched',
  closed: 'Closed',
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  unverified: 'Unverified',
  phone_verified: 'Phone Verified',
  id_submitted: 'ID Submitted',
  trust_badge: 'Trust Badge',
};

export const MATCH_STATUS_LABEL: Record<string, string> = {
  shortlisted: 'Shortlisted',
  intro_sent: 'Intro Sent',
  meeting_scheduled: 'Meeting Scheduled',
  accepted: 'Accepted',
  rejected: 'Rejected',
  proposed: 'Proposed',
  viewed: 'Viewed',
  declined: 'Declined',
};

export const MATCH_STATUS_BADGE: Record<string, string> = {
  shortlisted: 'bg-blue-50 text-blue-700 border-blue-200',
  intro_sent: 'bg-purple-50 text-purple-700 border-purple-200',
  meeting_scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  proposed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  viewed: 'bg-slate-50 text-slate-700 border-slate-200',
  declined: 'bg-gray-100 text-gray-700 border-gray-200',
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function getAvatarUrl(seed: string, gender: Gender): string {
  const style = gender === 'female' ? 'avataaars' : 'avataaars';
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50`;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}
