// Main type definitions export file
// This file re-exports all types from their respective modules

// User related types
export type {
  BodyConstitutionTag,
  LifestyleTag,
  HormoneStatus,
  HormoneTherapyDuration,
  ActivityLevel,
  GoalType,
  GoalMode,
  ConstraintType,
  GainDetectionTag,
  GoalModeConfig,
  ConstraintLayer,
  UserProfile,
  UserSettings,
  DietGoals,
  Milestone
} from './user';

// Condition related types
export type {
  ConditionTag,
  DailyState
} from './condition';

// Meal related types
export type {
  MealType,
  NutrientEstimate,
  MealLog,
  FoodPlan,
  FoodPlanMealSuggestion,
  MealPlanDetail,
  MealSuggestion
} from './meal';

// Weight related types
export type {
  WeightLog
} from './weight';

// Fridge related types
export type {
  FridgeItemCategory,
  FridgeItem
} from './fridge';

// Shopping related types
export type {
  ShoppingSuggestionRequestType,
  ShoppingSuggestionItem,
  ShoppingSuggestionCategory,
  ShoppingSuggestionResponse,
  ShoppingSuggestionRequest,
  ShoppingListItem,
  ShoppingList
} from './shopping';

// AI related types
export type {
  AIConsultationResponse,
  AIConsultation
} from './ai';

// Common types
export type {
  ConditionScore,
  BaseEntity,
  DateKey,
  ApiResponse
} from './common';