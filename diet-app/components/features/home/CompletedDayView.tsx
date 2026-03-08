"use client";

import React from "react";
import { QuickActions } from "@/components/features/home/QuickActions";
import type { MealLog } from "@/types";

interface CompletedDayViewProps {
  mealLogs: MealLog[];
  todayProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
  onNavigateToMealRecord: (mealType: string) => void;
  onNavigateToDetail: () => void;
}

export const CompletedDayView: React.FC<CompletedDayViewProps> = ({
  mealLogs,
  todayProgress,
  onNavigateToMealRecord,
  onNavigateToDetail,
}) => {
  // 未記録の食事を確認
  const hasBreakfast = mealLogs.some((log) => log.mealType === "breakfast");
  const hasLunch = mealLogs.some((log) => log.mealType === "lunch");
  const hasDinner = mealLogs.some((log) => log.mealType === "dinner");
  const missingMeals = [];
  if (!hasBreakfast) missingMeals.push("朝食");
  if (!hasLunch) missingMeals.push("昼食");

  // 栄養バランス評価（仮のデータ）
  const nutritionScore = 85; // 実際はAI分析から取得

  return (
    <section className="mb-6 space-y-4">
      {/* 完了メッセージ */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            晚ご飯を記録しました！
          </h2>
          <p className="text-gray-600 text-sm">
            {missingMeals.length > 0
              ? `お疲れさまでした。${missingMeals.join("・")}も必要に応じて記録できます。`
              : "今日の全食事記録完了！素晴らしい！"}
          </p>
        </div>
      </div>

      {/* 今日のサマリー */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          今日の成果
        </h3>

        <div className="space-y-4">
          {/* 食事記録詳細 */}
          <div className="grid grid-cols-3 gap-3">
            {["breakfast", "lunch", "dinner"].map((mealType) => {
              const meal = mealLogs.find((log) => log.mealType === mealType);
              const icons = {
                breakfast: "🌅",
                lunch: "☀️",
                dinner: "🌙",
              };
              const labels = {
                breakfast: "朝食",
                lunch: "昼食",
                dinner: "夕食",
              };

              if (meal) {
                // 記録済みの場合
                return (
                  <div
                    key={mealType}
                    className="bg-gray-50 rounded-lg p-3 text-center"
                  >
                    <div className="text-lg mb-1">
                      {icons[mealType as keyof typeof icons]}
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {labels[mealType as keyof typeof labels]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {meal.actualTime
                        ? new Date(meal.actualTime).toLocaleTimeString(
                            "ja-JP",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "記録済み"}
                    </div>
                  </div>
                );
              } else {
                // 未記録の場合（スキップへの導線）
                return (
                  <button
                    key={mealType}
                    onClick={() => onNavigateToMealRecord(mealType)}
                    className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-lg mb-1 opacity-50">
                      {icons[mealType as keyof typeof icons]}
                    </div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {labels[mealType as keyof typeof labels]}
                    </div>
                    <div className="text-xs text-blue-600">記録する</div>
                  </button>
                );
              }
            })}
          </div>

          {/* 栄養バランス */}
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚖️</span>
              <span className="text-sm font-medium text-gray-700">
                栄養バランス
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {nutritionScore}
              <span className="text-sm text-gray-600 font-normal">点</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              バランスの取れた食事でした
            </div>
          </div>

          {/* 詳細確認ボタン */}
          <button
            onClick={() => (window.location.href = "/record/meal?tab=history")}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            今日の食事を詳しく見る →
          </button>
        </div>
      </div>

      {/* 明日への準備 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">🌟</span>
          明日への準備
        </h3>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🛒</span>
                <span className="text-sm font-medium text-gray-700">
                  買い出しリスト作成
                </span>
              </div>
              <button
                onClick={() => (window.location.href = "/shopping")}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                作成する →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>💭</span>
                <span className="text-sm font-medium text-gray-700">
                  今日の振り返り
                </span>
              </div>
              <button
                onClick={() => (window.location.href = "/diary")}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                記録する →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 追加の食事記録 */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="text-center">
          <div className="text-sm text-gray-700 mb-3">
            間食や夜食も記録しますか？
          </div>
          <button
            onClick={() => onNavigateToMealRecord("snack")}
            className="px-6 py-2 bg-white border border-yellow-300 text-gray-700 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            🍪 間食を追加
          </button>
        </div>
      </div>

      {/* クイックアクション */}
      <QuickActions />
    </section>
  );
};
