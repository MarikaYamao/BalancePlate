'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { MealPlanDetail } from '@/types';

interface ShoppingPromptProps {
  mealPlans: MealPlanDetail[];
}

export function ShoppingPrompt({ mealPlans }: ShoppingPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // 不足食材を集計
  const allMissingIngredients = mealPlans.reduce((missing, plan) => {
    if (plan.missingIngredients && plan.missingIngredients.length > 0) {
      missing.push(...plan.missingIngredients);
    }
    return missing;
  }, [] as string[]);

  const uniqueMissingIngredients = [...new Set(allMissingIngredients)];
  
  // 今すぐ作れない料理の数
  const unCookableCount = mealPlans.filter(plan => plan.canMakeNow === false).length;

  // 不足食材がない場合は表示しない
  if (uniqueMissingIngredients.length === 0) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-xl">🛒</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800">
                買い出し提案
              </h3>
              <div className="text-xs text-orange-600">
                {unCookableCount > 0 ? `${unCookableCount}件の料理で食材が不足` : '栄養バランス改善のご提案'}
              </div>
            </div>
            <div className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full border border-orange-200">
              {uniqueMissingIngredients.length}件
            </div>
            <div className={`
              w-5 h-5 flex items-center justify-center rounded-full transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}>
              <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-4">
            {/* 不足食材リスト */}
            <div>
              <div className="text-sm font-semibold text-orange-800 mb-2">
                不足している食材
              </div>
              <div className="flex flex-wrap gap-1">
                {uniqueMissingIngredients.slice(0, 12).map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded border border-orange-200"
                  >
                    {ingredient}
                  </span>
                ))}
                {uniqueMissingIngredients.length > 12 && (
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded border border-orange-200">
                    +{uniqueMissingIngredients.length - 12}件
                  </span>
                )}
              </div>
            </div>

            {/* 作れない料理の表示 */}
            {unCookableCount > 0 && (
              <div>
                <div className="text-sm font-semibold text-red-700 mb-2">
                  🚫 現在作れない料理
                </div>
                <div className="space-y-1">
                  {mealPlans
                    .filter(plan => plan.canMakeNow === false)
                    .slice(0, 3)
                    .map((plan, idx) => (
                    <div key={idx} className="text-sm text-red-600">
                      • {plan.menu.join('、')}
                    </div>
                  ))}
                  {mealPlans.filter(plan => plan.canMakeNow === false).length > 3 && (
                    <div className="text-sm text-red-600">
                      • その他 {mealPlans.filter(plan => plan.canMakeNow === false).length - 3}件...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => router.push('/shopping')}
                variant="outline"
                size="small"
                className="text-xs bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                買い出し計画を見る
              </Button>
              <Button
                onClick={() => router.push('/shopping')}
                size="small"
                className="text-xs bg-orange-600 hover:bg-orange-700"
              >
                買い物リストを作成
              </Button>
            </div>

            {/* ヒント */}
            <div className="text-xs text-orange-600 text-center p-2 bg-orange-50 rounded border border-orange-200">
              💡 あなたの体質と好みに合わせた買い物リストを自動生成します
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}