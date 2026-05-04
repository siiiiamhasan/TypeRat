/**
 * Shared level/tier system used by both EnhancedResults and ProfileSection.
 * Single source of truth — no more duplicate threshold tables.
 */

export const LEVEL_THRESHOLDS = [
  { min: 150, label: 'Legendary',    color: '#7c3aed' },
  { min: 120, label: 'Expert',       color: '#059669' },
  { min: 90,  label: 'Advanced',     color: '#3b82f6' },
  { min: 60,  label: 'Intermediate', color: '#f59e0b' },
  { min: 40,  label: 'Beginner',     color: '#f97316' },
  { min: 0,   label: 'Starter',      color: '#9b9a97' },
];

/**
 * Returns { label, color } for a given WPM.
 */
export function getLevel(wpm) {
  return LEVEL_THRESHOLDS.find(t => wpm >= t.min) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

/**
 * Returns 0-100 progress % toward the next tier.
 */
export function getLevelProgress(wpm) {
  const idx = LEVEL_THRESHOLDS.findIndex(t => wpm >= t.min);
  if (idx === 0) return 100; // already at top
  const lower = LEVEL_THRESHOLDS[idx]?.min ?? 0;
  const upper = LEVEL_THRESHOLDS[idx - 1]?.min ?? lower;
  const span  = Math.max(upper - lower, 1);
  return Math.max(0, Math.min(100, Math.round(((wpm - lower) / span) * 100)));
}
