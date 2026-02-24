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
  // 最初の未記録食事を初期展開状態にする
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(
    unrecordedMeals.length > 0 ? unrecordedMeals[0] : null
  );
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
    <Card className="mx-4 mb-4 bg-[var(--color-bg-subtle)] border-[var(--color-border-light)]">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg">✨</div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            おすすめの食事
          </h3>
          <div className="text-xs font-semibold text-[var(--color-brand-primary)] bg-[var(--color-bg-elevated)] px-2 py-1 rounded-full ml-auto border border-[var(--color-border-light)]">
            AI提案
          </div>
        </div>

        {suggestions.feedback.overall && (
          <div className="mb-4 p-3 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-light)]">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
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
              yellow: 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
              orange: 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
              purple: 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
              pink: 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
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
                      <div className="font-semibold text-sm">{mealInfo.label}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] font-medium">
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
                  <div className="px-3 pb-3 bg-[var(--color-bg-elevated)]">
                    {/* 食材利用状況 - Phase19 */}
                    {(plan.availableIngredients || plan.missingIngredients) && (
                      <div className="mb-3 p-2 bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-light)]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{plan.canMakeNow ? '✅' : '🛒'}</span>
                          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {plan.canMakeNow ? '今すぐ作れる料理' : '買い足しが必要'}
                          </span>
                        </div>
                        
                        {plan.availableIngredients && plan.availableIngredients.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-[var(--color-text-tertiary)] mb-1">手持ち食材</div>
                            <div className="flex flex-wrap gap-1">
                              {plan.availableIngredients.map((ingredient, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {plan.missingIngredients && plan.missingIngredients.length > 0 && (
                          <div>
                            <div className="text-xs text-[var(--color-text-tertiary)] mb-1">必要な食材</div>
                            <div className="flex flex-wrap gap-1">
                              {plan.missingIngredients.map((ingredient, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-200"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* メニュー詳細 */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">メニュー</div>
                      <ul className="text-sm space-y-1">
                        {plan.menu.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-[var(--color-text-tertiary)] text-xs mt-0.5">•</span>
                            <span className="text-[var(--color-text-primary)] font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 理由 */}
                    {plan.reason && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">おすすめ理由</div>
                        <p className="text-sm text-[var(--color-text-secondary)] font-medium">{plan.reason}</p>
                      </div>
                    )}

                    {/* カロリーと準備方法 */}
                    <div className="flex gap-4 mb-3 text-xs">
                      {plan.calories && (
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--color-text-tertiary)]">🔥</span>
                          <span className="text-[var(--color-text-secondary)] font-medium">{plan.calories}kcal</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--color-text-tertiary)]">⏱️</span>
                        <span className="text-[var(--color-text-secondary)] font-medium">{plan.preparation}</span>
                      </div>
                    </div>

                    {/* 代替案 */}
                    {plan.alternatives && plan.alternatives.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">代替案</div>
                        <div className="text-sm text-[var(--color-text-secondary)] font-medium">
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
          <div className="mt-4 p-3 bg-[var(--color-bg-surface)] rounded-xl text-center border border-[var(--color-border-light)]">
            <p className="text-sm text-[var(--color-text-secondary)] font-semibold">
              {suggestions.feedback.encouragement}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}