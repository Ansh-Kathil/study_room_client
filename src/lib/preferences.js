// Centralized LocalStorage Preferences & Drafts Manager

export const PREF_KEYS = {
  PREFERRED_LANGUAGE: "preferred_language",
  SIDEBAR_OPEN: "mock_sidebar_open",
  PROBLEM_TAB: "mock_problem_tab",
  TIMER_PRESET: "mock_timer_preset",
  SOUND_ENABLED: "mock_sound_enabled",
  CONSOLE_COLLAPSED: "mock_console_collapsed",
  EDITOR_FONT_SIZE: "mock_editor_font_size",
  LAST_PROBLEM_ID: "interview_prep_last_problem_id",
  PREP_ACTIVE_TAB: "interview_prep_active_tab",
  PREP_DIFF_FILTER: "interview_prep_diff_filter",
  PREP_PATTERN_FILTER: "interview_prep_pattern_filter",
  BEHAVIORAL_PREPARED: "interview_prep_behavioral_prepared",
  SOLVED_PROBLEMS: "interview_prep_solved",
};

export const getStorageItem = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    return fallback;
  }
};

export const setStorageItem = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {}
};

export const getStorageJSON = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const setStorageJSON = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

// Draft Code per Problem & Language
export const getSavedCodeDraft = (problemId, language) => {
  if (typeof window === "undefined" || !problemId || !language) return null;
  try {
    return localStorage.getItem(`mock_draft_${problemId}_${language}`);
  } catch (e) {
    return null;
  }
};

export const saveCodeDraft = (problemId, language, code) => {
  if (typeof window === "undefined" || !problemId || !language) return;
  try {
    if (code && code.trim()) {
      localStorage.setItem(`mock_draft_${problemId}_${language}`, code);
    }
  } catch (e) {}
};

export const clearCodeDraft = (problemId, language) => {
  if (typeof window === "undefined" || !problemId || !language) return;
  try {
    localStorage.removeItem(`mock_draft_${problemId}_${language}`);
  } catch (e) {}
};
