"use client";

import React from "react";
import { BulkMealInput } from "@/components/features/meal/BulkMealInput";
import { MealSuggestions } from "@/components/features/home/MealSuggestions";
import { ShoppingPrompt } from "@/components/features/home/ShoppingPrompt";
import { QuickActions } from "@/components/features/home/QuickActions";
import { MealRecordGrid } from "./MealRecordGrid";
import { CompletedDayView } from "./CompletedDayView";
import type { MealType, MealLog, MealPlanDetail } from "@/types";

interface MainActionAreaProps {
  showBulkInput: boolean;
  isLoadingMeals: boolean;
  suggestions: any;
  unrecordedMealTypes: string[];
  missedMeals: MealType[];
  mealLogs: MealLog[];
  todayProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
  resetTime: string;
  onBulkMealSubmit: (meals: Record<MealType, string>) => Promise<void>;
  onBulkInputCancel: () => void;
}

export const MainActionArea: React.FC<MainActionAreaProps> = ({
  showBulkInput,
  isLoadingMeals,
  suggestions,
  unrecordedMealTypes,
  missedMeals,
  mealLogs,
  todayProgress,
  resetTime,
  onBulkMealSubmit,
  onBulkInputCancel,
}) => {
  // 晩御飯が記録されている場合は完了画面を表示（最優先）
  const hasDinner = mealLogs.some((log) => log.mealType === "dinner");
  if (hasDinner) {
    return (
      <CompletedDayView
        mealLogs={mealLogs}
        todayProgress={todayProgress}
        onNavigateToMealRecord={(mealType) => {
          window.location.href = `/record/meal?type=${mealType}`;
        }}
        onNavigateToDetail={() => {
          window.location.href = "/record/meal";
        }}
      />
    );
  }

  // バルク入力表示
  if (showBulkInput && !isLoadingMeals) {
    return (
      <section className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-1 shadow-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              <h3 className="font-bold text-gray-800">まとめて記録</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                時短機能
              </span>
            </div>
            <BulkMealInput
              missedMeals={missedMeals}
              onSubmit={onBulkMealSubmit}
              onCancel={onBulkInputCancel}
            />
          </div>
        </div>
      </section>
    );
  }

  // AI提案表示（晩御飯が未記録の場合のみ）
  if (suggestions && unrecordedMealTypes.length > 0 && !hasDinner) {
    return (
      <section className="mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-1 shadow-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧠</span>
              <h3 className="font-bold text-gray-800">AI提案</h3>
            </div>
            <MealSuggestions
              suggestions={suggestions}
              unrecordedMeals={unrecordedMealTypes as MealType[]}
              resetTime={resetTime}
            />

            {/* Phase20: 買い出し提案 */}
            <ShoppingPrompt
              mealPlans={
                Object.values(suggestions.mealPlans).filter(
                  Boolean,
                ) as MealPlanDetail[]
              }
            />
          </div>
        </div>
      </section>
    );
  }

  // 通常の食事記録画面
  return (
    <section className="mb-6">
      <div className="space-y-4">
        <MealRecordGrid
          mealLogs={mealLogs}
          todayProgress={todayProgress}
          onNavigateToMealRecord={(mealType) => {
            window.location.href = `/record/meal?type=${mealType}`;
          }}
          onNavigateToDetail={() => {
            window.location.href = "/record/meal";
          }}
        />
        <QuickActions />
      </div>
    </section>
  );
};
