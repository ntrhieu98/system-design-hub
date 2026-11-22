// Single source of truth for every "shared number" the site displays: the
// headline counters, the module grid, the sidebar and the page copy all read
// from here instead of hard-coding a figure.
//
// `scripts/check-stats.mjs` runs before every build and fails it when these
// numbers drift away from the actual content, so a stale "64 chủ đề" cannot
// survive a content edit.
export const SITE_STATS = {
  "modules": 8,
  "topics": 66,
  "diagrams": 51,
  "keywords": 115,
  "quizzes": 45,
  "adrs": 6,
  "exercises": 8,
  "weeks": 12
};
