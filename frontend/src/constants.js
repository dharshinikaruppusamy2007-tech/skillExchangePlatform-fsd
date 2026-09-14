// Shared list of predefined categories/levels used across the app.
// These match the options allowed when creating or filtering skills.
export const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Design',
  'Communication',
  'Languages',
  'Other',
]

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export const SKILL_TYPES = [
  { value: 'teach', label: 'Teaching Skills' },
  { value: 'learn', label: 'Learning Skills' },
]

export const SESSION_STATUSES = ['Upcoming', 'Completed', 'Cancelled']

export const SESSION_MODES = ['Online', 'Offline']

export const REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled']

export const DURATION_OPTIONS = [30, 45, 60, 90, 120]

// Pastel badge styles shared by the whole UI
export const BADGE_STYLES = {
  category: 'bg-primary-50 text-primary-700',
  level: 'bg-sky-50 text-sky-600',
  teach: 'bg-emerald-50 text-emerald-700',
  learn: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
  Upcoming: 'bg-sky-50 text-sky-600',
  Completed: 'bg-emerald-50 text-emerald-700',
  CompletedPending: 'bg-emerald-50 text-emerald-700',
  Online: 'bg-sky-50 text-sky-600',
  Offline: 'bg-amber-50 text-amber-700',
  admin: 'bg-primary-50 text-primary-700',
  user: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
}