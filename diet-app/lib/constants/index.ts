// Main constants exports

// Condition tags (existing)
export * from './conditionTags';

// Meal-related constants
export * from './meals/mealTypes';

// UI constants
export * from './ui/colors';

// Validation constants
export * from './validation/limits';

// Common application constants
export const APP_CONFIG = {
  NAME: 'やさしいダイエット',
  VERSION: '1.0.0',
  DESCRIPTION: '体質と習慣に寄り添うパーソナル ダイエット支援アプリ',
  DEFAULT_RESET_TIME: '04:00',
  ENCRYPTION_ENABLED: true,
  DEVELOPMENT_MODE: process.env.NODE_ENV === 'development'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: 'diet-app-user-settings',
  LAST_SYNC: 'diet-app-last-sync',
  ERROR_LOG: 'diet-app-error-log',
  PERFORMANCE_METRICS: 'diet-app-performance',
  ONBOARDING_STATUS: 'diet-app-onboarding',
  THEME_PREFERENCE: 'diet-app-theme'
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  USER_SETTINGS: ['userSettings'],
  MEAL_LOGS: (dateKey?: string) => dateKey ? ['mealLogs', dateKey] : ['mealLogs'],
  WEIGHT_LOGS: (dateKey?: string) => dateKey ? ['weightLogs', dateKey] : ['weightLogs'],
  DAILY_STATE: (dateKey?: string) => dateKey ? ['dailyState', dateKey] : ['dailyState'],
  FOOD_PLANS: (dateKey?: string) => dateKey ? ['foodPlans', dateKey] : ['foodPlans'],
  FRIDGE_ITEMS: ['fridgeItems'],
  AI_CONSULTATIONS: (dateKey?: string) => dateKey ? ['aiConsultations', dateKey] : ['aiConsultations']
} as const;