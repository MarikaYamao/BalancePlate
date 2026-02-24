// Validation constants for input limits and constraints

// Text input limits
export const TEXT_LIMITS = {
  MEAL_TEXT: {
    MIN: 1,
    MAX: 1000,
    DEFAULT: 500
  },
  FREE_MEMO: {
    MIN: 0,
    MAX: 500,
    DEFAULT: 200
  },
  WEIGHT_NOTE: {
    MIN: 0,
    MAX: 200,
    DEFAULT: 100
  },
  USER_NOTES: {
    MIN: 0,
    MAX: 1000,
    DEFAULT: 500
  },
  FOOD_NAME: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 50
  }
} as const;

// Numeric input limits
export const NUMERIC_LIMITS = {
  WEIGHT: {
    MIN: 10, // kg
    MAX: 500, // kg
    DECIMAL_PLACES: 1
  },
  HEIGHT: {
    MIN: 100, // cm
    MAX: 250, // cm
    DECIMAL_PLACES: 0
  },
  AGE: {
    MIN: 13,
    MAX: 120
  },
  BIRTH_YEAR: {
    MIN: 1900,
    MAX: new Date().getFullYear()
  }
} as const;

// Selection limits
export const SELECTION_LIMITS = {
  CONDITION_TAGS: {
    MIN: 0,
    MAX: 5,
    DEFAULT: 3
  },
  BODY_CONSTITUTION_TAGS: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 5
  },
  LIFESTYLE_TAGS: {
    MIN: 0,
    MAX: 8,
    DEFAULT: 5
  },
  FOOD_PREFERENCES: {
    MIN: 0,
    MAX: 20,
    DEFAULT: 10
  }
} as const;

// Date constraints
export const DATE_CONSTRAINTS = {
  RESET_TIME: {
    MIN_HOUR: 0,
    MAX_HOUR: 23,
    MIN_MINUTE: 0,
    MAX_MINUTE: 59,
    DEFAULT: '04:00'
  },
  DATE_RANGE: {
    MAX_DAYS_BACK: 365,
    MAX_DAYS_FORWARD: 30
  }
} as const;

// File upload limits (if applicable)
export const FILE_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_WIDTH: 2048,
    MAX_HEIGHT: 2048
  },
  BACKUP: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['application/json']
  }
} as const;

// Rate limiting
export const RATE_LIMITS = {
  AI_REQUESTS: {
    PER_MINUTE: 10,
    PER_HOUR: 100,
    PER_DAY: 1000
  },
  BACKUP_EXPORT: {
    PER_HOUR: 5,
    PER_DAY: 20
  },
  PASSWORD_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000 // 30 minutes
  }
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  USER_SETTINGS: 5 * 60 * 1000, // 5 minutes
  MEAL_LOGS: 3 * 60 * 1000, // 3 minutes
  WEIGHT_LOGS: 5 * 60 * 1000, // 5 minutes
  DAILY_STATE: 2 * 60 * 1000, // 2 minutes
  FOOD_PLANS: 10 * 60 * 1000, // 10 minutes
  FRIDGE_ITEMS: 1 * 60 * 1000, // 1 minute
  AI_CONSULTATIONS: 30 * 60 * 1000 // 30 minutes
} as const;