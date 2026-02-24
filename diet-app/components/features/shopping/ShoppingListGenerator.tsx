'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useShoppingSuggestions } from '@/lib/hooks/useShoppingSuggestions';
import { useFridgeItems } from '@/lib/hooks/useFridgeItems';
import type { ShoppingSuggestionResponse, MealPlanDetail } from '@/types';

interface ShoppingListGeneratorProps {
  weeklyMealPlans?: MealPlanDetail[];
  className?: string;
}

export function ShoppingListGenerator({ weeklyMealPlans, className }: ShoppingListGeneratorProps) {
  const [targetDays, setTargetDays] = useState(7);
  const [generationType, setGenerationType] = useState<'weekly_planning' | 'meal_based'>('weekly_planning');
  
  const { generateSuggestions, suggestions, isLoading, error } = useShoppingSuggestions();
  const { data: fridgeItems } = useFridgeItems();

  const handleGenerateFromMeals = async () => {
    if (!weeklyMealPlans || weeklyMealPlans.length === 0) {
      alert('献立データがありません');
      return;
    }

    try {
      await generateSuggestions({
        targetDays,
        requestType: 'specific_meal'
      });
    } catch (error) {
      console.error('Failed to generate meal-based shopping list:', error);
    }
  };

  const handleGenerateWeekly = async () => {
    try {
      await generateSuggestions({
        targetDays,
        requestType: 'weekly_planning'
      });
    } catch (error) {
      console.error('Failed to generate weekly shopping list:', error);
    }
  };

  const missingIngredientsFromMeals = weeklyMealPlans?.reduce((missing, meal) => {
    if (meal.missingIngredients) {
      missing.push(...meal.missingIngredients);
    }
    return missing;
  }, [] as string[]) || [];

  const uniqueMissingIngredients = [...new Set(missingIngredientsFromMeals)];

  return (
    <div className={className}>
      <Card className="p-4 mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          買い出しリスト生成
        </h3>

        <div className="space-y-4">
          {/* 生成方法選択 */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              生成方法
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGenerationType('weekly_planning')}
                className={`
                  p-3 rounded-lg text-xs font-semibold border transition-colors text-center
                  ${generationType === 'weekly_planning'
                    ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-elevated)]'
                  }
                `}
              >
                <div>週間計画から</div>
                <div className="text-xs opacity-80">バランス重視</div>
              </button>
              <button
                onClick={() => setGenerationType('meal_based')}
                disabled={uniqueMissingIngredients.length === 0}
                className={`
                  p-3 rounded-lg text-xs font-semibold border transition-colors text-center
                  ${generationType === 'meal_based'
                    ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                    : uniqueMissingIngredients.length === 0
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-elevated)]'
                  }
                `}
              >
                <div>献立から</div>
                <div className="text-xs opacity-80">
                  {uniqueMissingIngredients.length > 0 ? '不足食材あり' : '不足食材なし'}
                </div>
              </button>
            </div>
          </div>

          {/* 期間設定 */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              計画期間
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 7, 14].map(days => (
                <button
                  key={days}
                  onClick={() => setTargetDays(days)}
                  className={`
                    p-2 rounded-lg text-sm font-semibold border transition-colors
                    ${targetDays === days
                      ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                      : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-elevated)]'
                    }
                  `}
                >
                  {days}日
                </button>
              ))}
            </div>
          </div>

          {/* 不足食材プレビュー */}
          {generationType === 'meal_based' && uniqueMissingIngredients.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm font-semibold text-orange-800 mb-2">
                献立から検出された不足食材 ({uniqueMissingIngredients.length}件)
              </div>
              <div className="flex flex-wrap gap-1">
                {uniqueMissingIngredients.slice(0, 8).map((ingredient, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                    {ingredient}
                  </span>
                ))}
                {uniqueMissingIngredients.length > 8 && (
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                    +{uniqueMissingIngredients.length - 8}件
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 冷蔵庫状況 */}
          {fridgeItems && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-800 mb-1">
                冷蔵庫の状況
              </div>
              <div className="text-xs text-blue-700">
                利用可能: {fridgeItems.filter(item => item.available).length}件 / 
                総計: {fridgeItems.length}件
              </div>
            </div>
          )}

          {/* 生成ボタン */}
          <Button
            onClick={generationType === 'weekly_planning' ? handleGenerateWeekly : handleGenerateFromMeals}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '生成中...' : '買い出しリストを生成'}
          </Button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <div className="text-red-500">⚠️</div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* 生成結果のプレビュー */}
      {suggestions && (
        <ShoppingListPreview 
          suggestions={suggestions}
          generationType={generationType}
        />
      )}
    </div>
  );
}

interface ShoppingListPreviewProps {
  suggestions: ShoppingSuggestionResponse;
  generationType: 'weekly_planning' | 'meal_based';
}

function ShoppingListPreview({ suggestions, generationType }: ShoppingListPreviewProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const selectAllInCategory = (category: any) => {
    const newSelected = new Set(selectedItems);
    category.items.forEach((item: any) => newSelected.add(item.name));
    setSelectedItems(newSelected);
  };

  const totalSelectedCost = suggestions.suggestions
    .flatMap(cat => cat.items)
    .filter(item => selectedItems.has(item.name))
    .reduce((total, item) => total + item.estimatedPrice, 0);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border-light)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            買い出しリスト {generationType === 'meal_based' ? '(献立ベース)' : '(週間計画)'}
          </h3>
          <div className="text-sm">
            <span className="text-[var(--color-text-secondary)]">選択中: </span>
            <span className="font-semibold text-[var(--color-brand-primary)]">
              ¥{totalSelectedCost.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
          アイテムをタップして買い物リストに追加
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {suggestions.suggestions.map((category) => (
          <div key={category.category} className="border-b border-[var(--color-border-light)] last:border-b-0">
            <div className="p-4 bg-[var(--color-bg-elevated)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(category.category)}
                  </span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {category.displayName}
                  </span>
                  {category.urgency === 'high' && (
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">
                      急ぎ
                    </span>
                  )}
                </div>
                <button
                  onClick={() => selectAllInCategory(category)}
                  className="text-xs px-3 py-1 bg-[var(--color-brand-primary)] text-white rounded hover:opacity-80"
                >
                  全選択
                </button>
              </div>

              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleItem(item.name)}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedItems.has(item.name)
                        ? 'bg-[var(--color-brand-primary)] bg-opacity-10 border-[var(--color-brand-primary)]'
                        : 'bg-[var(--color-bg-surface)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-elevated)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                          ${selectedItems.has(item.name)
                            ? 'bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]'
                            : 'border-[var(--color-border-default)]'
                          }
                        `}>
                          {selectedItems.has(item.name) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-text-primary)]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {item.reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[var(--color-text-primary)]">
                          ¥{item.estimatedPrice}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          優先度: {item.priority}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItems.size > 0 && (
        <div className="p-4 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-light)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              選択したアイテム: {selectedItems.size}件
            </span>
            <span className="text-lg font-bold text-[var(--color-brand-primary)]">
              ¥{totalSelectedCost.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="small" className="text-xs">
              リストを保存
            </Button>
            <Button size="small" className="text-xs">
              買い物を開始
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    protein: '🥩',
    vegetables: '🥬',
    grains: '🌾',
    dairy: '🥛',
    fats: '🥑',
    seasonings: '🧂',
    fruits: '🍎'
  };
  return icons[category] || '🛒';
}