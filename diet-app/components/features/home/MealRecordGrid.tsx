"use client";

import React from "react";
import type { MealLog } from "@/types";

interface MealRecordGridProps {
  mealLogs: MealLog[];
  todayProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
  onNavigateToMealRecord: (mealType: string) => void;
  onNavigateToDetail: () => void;
}

export const MealRecordGrid: React.FC<MealRecordGridProps> = ({
  mealLogs,
  todayProgress,
  onNavigateToMealRecord,
  onNavigateToDetail,
}) => {
  const labels = {
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
  };
  const icons = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h3 className="font-bold text-gray-800">今日の食事</h3>
            <p className="text-sm text-gray-600">
              {todayProgress.percentage === 0
                ? "今日最初の食事を記録しましょう"
                : todayProgress.percentage === 100
                  ? "素晴らしい！すべて記録済みです"
                  : `残り${3 - todayProgress.completed}食の記録をしましょう`}
            </p>
          </div>
        </div>

        {/* 詳細画面へのリンク */}
        {mealLogs.length > 0 && (
          <button
            onClick={onNavigateToDetail}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            詳しく見る →
          </button>
        )}
      </div>

      {/* 食事記録の状況とアクション */}
      <div className="grid grid-cols-3 gap-3">
        {["breakfast", "lunch", "dinner"].map((mealType) => {
          const isRecorded = mealLogs.some(
            (log) => log.mealType === mealType,
          );

          if (isRecorded) {
            // 記録済みの場合：記録内容のプレビュー
            const meal = mealLogs.find(
              (log) => log.mealType === mealType,
            );
            return (
              <div
                key={mealType}
                className="p-3 rounded-lg text-center bg-green-100 border-2 border-green-200"
              >
                <div className="text-lg mb-1">
                  {icons[mealType as keyof typeof icons]}
                </div>
                <div className="text-xs font-medium text-green-700 mb-1">
                  {labels[mealType as keyof typeof labels]}
                </div>
                <div className="text-xs text-green-600">
                  {meal?.actualTime
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
            // 未記録の場合：記録ボタン
            return (
              <button
                key={mealType}
                onClick={() => onNavigateToMealRecord(mealType)}
                className="p-3 rounded-lg text-center bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="text-lg mb-1">
                  {icons[mealType as keyof typeof icons]}
                </div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {labels[mealType as keyof typeof labels]}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  記録する
                </div>
              </button>
            );
          }
        })}
      </div>

      {/* 全て記録済みの場合の追加アクション */}
      {todayProgress.percentage === 100 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 mb-2">
            間食も記録しますか？
          </div>
          <button
            onClick={() => onNavigateToMealRecord("snack")}
            className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🍪 間食を追加
          </button>
        </div>
      )}
    </div>
  );
};