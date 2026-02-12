'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { MealType, MealPlanDetail, AIConsultationResponse } from '@/types';

interface MealSuggestionsProps {
  suggestions: AIConsultationResponse | null;
  unrecordedMeals: MealType[];
  resetTime: string;
}

export function MealSuggestions({ suggestions, unrecordedMeals, resetTime }: MealSuggestionsProps) {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);
  const router = useRouter();

  const mealLabels = {
    breakfast: { label: '朝食', icon: '🌅', color: 'yellow' as const },
    lunch: { label: '昼食', icon: '☀️', color: 'orange' as const },
    dinner: { label: '夕食', icon: '🌙', color: 'purple' as const },
    snack: { label: '間食', icon: '🍪', color: 'pink' as const }
  };

  if (!suggestions || unrecordedMeals.length === 0) {
    return null;
  }

  const availableSuggestions = unrecordedMeals
    .map(mealType => ({
      mealType,
      plan: suggestions.mealPlans[mealType]
    }))
    .filter(({ plan }) => plan);

  if (availableSuggestions.length === 0) {
    return null;
  }

  const handleUseSuggestion = (mealType: MealType, plan: MealPlanDetail) => {
    // メニューを文字列として整形
    const menuText = plan.menu.join('、');
    const queryParams = new URLSearchParams({
      type: mealType,
      suggestion: menuText
    }).toString();
    
    router.push(`/record/meal?${queryParams}`);
  };

  return (
    <Card className="mx-4 mb-4 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg">✨</div>
          <h3 className="text-lg font-semibold text-green-900">
            おすすめの食事
          </h3>
          <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full ml-auto">
            AI提案
          </div>
        </div>

        {suggestions.feedback.overall && (
          <div className="mb-4 p-3 bg-white/70 rounded-lg">
            <p className="text-sm text-green-800">
              {suggestions.feedback.overall}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {availableSuggestions.map(({ mealType, plan }) => {
            if (!plan) return null;
            
            const mealInfo = mealLabels[mealType];
            const isExpanded = expandedMeal === mealType;
            const colorClasses = {
              yellow: 'border-yellow-300 bg-yellow-50 text-yellow-900',
              orange: 'border-orange-300 bg-orange-50 text-orange-900',
              purple: 'border-purple-300 bg-purple-50 text-purple-900',
              pink: 'border-pink-300 bg-pink-50 text-pink-900'
            };

            return (
              <div
                key={mealType}
                className={`
                  border rounded-lg overflow-hidden transition-all duration-200
                  ${colorClasses[mealInfo.color]}
                  ${isExpanded ? 'shadow-md' : 'shadow-sm'}
                `}
              >
                <button
                  onClick={() => setExpandedMeal(isExpanded ? null : mealType)}
                  className={`
                    w-full p-3 text-left hover:opacity-80 transition-opacity
                    ${colorClasses[mealInfo.color]}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{mealInfo.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{mealInfo.label}</div>
                      <div className="text-xs opacity-75">
                        {plan.menu.slice(0, 2).join('、')}
                        {plan.menu.length > 2 && '...'}
                      </div>
                    </div>
                    <div className={`
                      w-5 h-5 flex items-center justify-center rounded-full
                      transition-transform duration-200
                      ${isExpanded ? 'rotate-180' : ''}
                    `}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 bg-white/50">
                    {/* メニュー詳細 */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">メニュー</div>
                      <ul className="text-sm space-y-1">
                        {plan.menu.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-400 text-xs mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 理由 */}
                    {plan.reason && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">おすすめ理由</div>
                        <p className="text-sm text-gray-600">{plan.reason}</p>
                      </div>
                    )}

                    {/* カロリーと準備方法 */}
                    <div className="flex gap-4 mb-3 text-xs">
                      {plan.calories && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">🔥</span>
                          <span>{plan.calories}kcal</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">⏱️</span>
                        <span>{plan.preparation}</span>
                      </div>
                    </div>

                    {/* 代替案 */}
                    {plan.alternatives && plan.alternatives.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">代替案</div>
                        <div className="text-sm text-gray-600">
                          {plan.alternatives.join('、')}
                        </div>
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUseSuggestion(mealType, plan)}
                        size="small"
                        className="flex-1 text-xs"
                      >
                        この提案で記録
                      </Button>
                      <Button
                        onClick={() => router.push(`/record/meal?type=${mealType}`)}
                        variant="outline"
                        size="small"
                        className="flex-1 text-xs"
                      >
                        自分で入力
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 励ましメッセージ */}
        {suggestions.feedback.encouragement && (
          <div className="mt-4 p-3 bg-white/70 rounded-lg text-center">
            <p className="text-sm text-green-800 font-medium">
              {suggestions.feedback.encouragement}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}