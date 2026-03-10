"use client";

import { useState, useEffect } from "react";
import { type MealLog } from "@/types";
import { mealLogRepository } from "@/lib/db/repositories";
import { isMealSkipped } from "@/lib/utils/mealUtils";
import { MEAL_TYPE_INFO } from "@/lib/constants/mealTypes";

interface MealHistoryProps {
  dateKey: string;
  mealLogs?: MealLog[];
  onEdit?: (meal: MealLog) => void;
  onDelete?: (meal: MealLog) => void;
  isDeleting?: boolean;
}

export function MealHistory({ dateKey, mealLogs, onEdit, onDelete, isDeleting }: MealHistoryProps) {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (mealLogs) {
      // 親コンポーネントからmealLogsが渡される場合はそれを使用
      const filteredMeals = mealLogs.filter((meal) => !isMealSkipped(meal));
      const sortedMeals = filteredMeals.sort((a, b) => {
        const typeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return typeOrder[a.mealType] - typeOrder[b.mealType];
      });
      setMeals(sortedMeals);
      setLoading(false);
    } else {
      // 渡されない場合は自前でロード
      loadMeals();
    }
  }, [dateKey, mealLogs]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const mealLogs = await mealLogRepository.getByDate(dateKey);
      // スキップされた食事を除外して、時間順にソート（朝食→昼食→夕食→間食の順）
      const filteredMeals = mealLogs.filter((meal) => !isMealSkipped(meal));
      const sortedMeals = filteredMeals.sort((a, b) => {
        const typeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return typeOrder[a.mealType] - typeOrder[b.mealType];
      });
      setMeals(sortedMeals);
    } catch (err) {
      console.error("Failed to load meals:", err);
      setError("食事記録の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meal: MealLog) => {
    if (
      !confirm(`${MEAL_TYPE_INFO[meal.mealType].label}の記録を削除しますか？`)
    ) {
      return;
    }

    if (onDelete) {
      // 親コンポーネントのonDeleteハンドラを呼ぶ
      setDeletingId(meal.id);
      onDelete(meal);
      // isDeletingが渡されている場合は、それを使うので、ローカルの状態はリセット
      if (isDeleting !== undefined) {
        setTimeout(() => setDeletingId(null), 100);
      }
    } else {
      // onDeleteが無い場合は従来通り自前で削除
      try {
        setDeletingId(meal.id);
        await mealLogRepository.delete(meal.id);
        await loadMeals(); // リロード
      } catch (err) {
        console.error("Failed to delete meal:", err);
        alert("削除に失敗しました");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // フィードバックデータの存在確認（個別食事用）
  const checkStoredFeedback = (dateKey: string, mealTime: Date): boolean => {
    try {
      const { consultationStorage } = require("@/lib/ai/consultationStorage");
      return consultationStorage.checkStoredFeedback(dateKey, mealTime);
    } catch (error) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 animate-pulse rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  }

  if (meals.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-3xl mb-2">🍽️</div>
        <p>まだ食事の記録がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => {
        const typeInfo = MEAL_TYPE_INFO[meal.mealType];
        const isCurrentlyDeleting = deletingId === meal.id || (isDeleting && deletingId === meal.id);
        const hasFeedback =
          meal.aiAnalysis || checkStoredFeedback(dateKey, meal.actualTime);

        return (
          <div
            key={meal.id}
            className={`
              p-4 border rounded-lg transition-all
              ${isCurrentlyDeleting ? "opacity-50" : ""}
              ${
                hasFeedback
                  ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  : "bg-white border-gray-200 hover:shadow-md"
              }
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{typeInfo.icon}</span>
                <span className="font-medium">{typeInfo.label}</span>
                <span className="text-sm text-gray-500">
                  {formatTime(meal.actualTime)}
                </span>
                {hasFeedback && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                    💬 フィードバック
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {onEdit && !isCurrentlyDeleting && (
                  <button
                    onClick={() => onEdit(meal)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    編集
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => handleDelete(meal)}
                    disabled={isCurrentlyDeleting}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {isCurrentlyDeleting ? "削除中..." : "削除"}
                  </button>
                )}
              </div>
            </div>

            <div className="text-gray-700 whitespace-pre-wrap">{meal.text}</div>

            {meal.followedPlan && (
              <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                プランに従いました
              </div>
            )}

            {meal.aiAnalysis && meal.aiAnalysis.suggestions && meal.aiAnalysis.suggestions.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                <div className="font-medium text-blue-900 mb-1">AI分析</div>
                <ul className="mt-1 space-y-1">
                  {meal.aiAnalysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-blue-600">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}
