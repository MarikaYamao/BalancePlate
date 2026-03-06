'use client';

import { useState, useEffect } from 'react';
import { type MealLog, type MealType } from '@/types';
import { mealLogRepository } from '@/lib/db/repositories';

interface MealHistoryProps {
  dateKey: string;
  onEdit?: (meal: MealLog) => void;
  onDelete?: (meal: MealLog) => void;
  onShowDetail?: (meal: MealLog, aiResponse?: any) => void;
}

const mealTypeLabels: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: '朝食', icon: '🌅' },
  lunch: { label: '昼食', icon: '☀️' },
  dinner: { label: '夕食', icon: '🌙' },
  snack: { label: '間食', icon: '🍿' }
};

export function MealHistory({ dateKey, onEdit, onDelete, onShowDetail }: MealHistoryProps) {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMeals();
  }, [dateKey]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const mealLogs = await mealLogRepository.getByDate(dateKey);
      // 時間順にソート（朝食→昼食→夕食→間食の順）
      const sortedMeals = mealLogs.sort((a, b) => {
        const typeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return typeOrder[a.mealType] - typeOrder[b.mealType];
      });
      setMeals(sortedMeals);
    } catch (err) {
      console.error('Failed to load meals:', err);
      setError('食事記録の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meal: MealLog) => {
    if (!confirm(`${mealTypeLabels[meal.mealType].label}の記録を削除しますか？`)) {
      return;
    }

    try {
      setDeletingId(meal.id);
      await mealLogRepository.delete(meal.id);
      await loadMeals(); // リロード
      if (onDelete) {
        onDelete(meal);
      }
    } catch (err) {
      console.error('Failed to delete meal:', err);
      alert('削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // 統合フィードバックデータの取得
  const getIntegratedFeedback = (dateKey: string): any | null => {
    try {
      const { consultationStorage } = require("@/lib/ai/consultationStorage");
      return consultationStorage.findIntegrated(dateKey);
    } catch (error) {
      return null;
    }
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
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-3xl mb-2">🍽️</div>
        <p>まだ食事の記録がありません</p>
      </div>
    );
  }

  // 統合フィードバックを取得
  const integratedFeedback = getIntegratedFeedback(dateKey);

  return (
    <div className="space-y-3">
      {/* 統合フィードバックカード */}
      {integratedFeedback && (
        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 hover:bg-blue-100">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="font-medium">統合AIフィードバック</span>
              <span className="text-sm text-gray-500">
                今日の食事分析
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                💬 統合分析
              </span>
            </div>
          </div>
          
          <div className="text-gray-700 whitespace-pre-wrap text-sm">
            {integratedFeedback.response?.substring(0, 100) + '...'}
          </div>
          
          <button
            onClick={() => {
              // 統合フィードバックの詳細を表示するモーダルを開く
              if (onShowDetail) {
                // 代表として最初の食事を使用（モーダル表示のため）
                const representativeMeal = meals[0];
                if (representativeMeal) {
                  onShowDetail(representativeMeal, integratedFeedback.response);
                }
              }
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            詳細を見る →
          </button>
        </div>
      )}
      
      {meals.map((meal) => {
        const typeInfo = mealTypeLabels[meal.mealType];
        const isDeleting = deletingId === meal.id;
        const hasFeedback = meal.aiAnalysis || checkStoredFeedback(dateKey, meal.actualTime);

        return (
          <div
            key={meal.id}
            className={`
              p-4 border rounded-lg transition-all
              ${isDeleting ? 'opacity-50' : ''}
              ${hasFeedback 
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                : 'bg-white border-gray-200 hover:shadow-md'}
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
                {onEdit && !isDeleting && (
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
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {isDeleting ? '削除中...' : '削除'}
                  </button>
                )}
              </div>
            </div>

            <div className="text-gray-700 whitespace-pre-wrap">
              {meal.text}
            </div>

            {meal.followedPlan && (
              <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                プランに従いました
              </div>
            )}

            {meal.aiAnalysis && (
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                <div className="font-medium text-blue-900 mb-1">AI分析</div>
                {meal.aiAnalysis.estimatedNutrients && (
                  <div className="text-blue-700">
                    推定カロリー: {meal.aiAnalysis.estimatedNutrients.calories}kcal
                  </div>
                )}
                {meal.aiAnalysis.suggestions && meal.aiAnalysis.suggestions.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {meal.aiAnalysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-blue-600">• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 合計カロリー（AI分析がある場合） */}
      {meals.some(m => m.aiAnalysis?.estimatedNutrients?.calories) && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-700">本日の推定合計</div>
          <div className="text-2xl font-bold text-gray-900">
            {meals.reduce((sum, meal) => 
              sum + (meal.aiAnalysis?.estimatedNutrients?.calories || 0), 0
            )} kcal
          </div>
        </div>
      )}
    </div>
  );
}