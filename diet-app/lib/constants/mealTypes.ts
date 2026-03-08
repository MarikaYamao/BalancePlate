import { MealType } from "@/types";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
} as const;

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍪",
} as const;

export const MEAL_TYPE_COLORS: Record<MealType, "yellow" | "orange" | "purple" | "pink"> = {
  breakfast: "yellow",
  lunch: "orange",
  dinner: "purple",
  snack: "pink",
} as const;

export const MEAL_TYPE_INFO: Record<MealType, { label: string; icon: string; color: "yellow" | "orange" | "purple" | "pink" }> = {
  breakfast: { label: MEAL_TYPE_LABELS.breakfast, icon: MEAL_TYPE_ICONS.breakfast, color: MEAL_TYPE_COLORS.breakfast },
  lunch: { label: MEAL_TYPE_LABELS.lunch, icon: MEAL_TYPE_ICONS.lunch, color: MEAL_TYPE_COLORS.lunch },
  dinner: { label: MEAL_TYPE_LABELS.dinner, icon: MEAL_TYPE_ICONS.dinner, color: MEAL_TYPE_COLORS.dinner },
  snack: { label: MEAL_TYPE_LABELS.snack, icon: MEAL_TYPE_ICONS.snack, color: MEAL_TYPE_COLORS.snack },
} as const;

// 拡張版（AI提案用の"tomorrow"を含む）
export const EXTENDED_MEAL_TYPE_LABELS: Record<string, string> = {
  ...MEAL_TYPE_LABELS,
  tomorrow: "明日に向けて",
} as const;