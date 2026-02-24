'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useShoppingSuggestions } from '@/lib/hooks/useShoppingSuggestions';
import type { ShoppingSuggestionResponse } from '@/types';

export default function ShoppingPage() {
  const [targetDays, setTargetDays] = useState(7);
  const { generateSuggestions, suggestions, isLoading, error, hasValidSettings } = useShoppingSuggestions();

  const handleGenerateSuggestions = async () => {
    try {
      await generateSuggestions({ targetDays });
    } catch (error) {
      console.error('Failed to generate shopping suggestions:', error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[var(--color-bg-base)] pb-20">
        {/* ヘッダー */}
        <div className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-light)]">
          <div className="px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🛒</div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                買い出し提案
              </h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              あなたの体質と冷蔵庫の状況に合わせた買い物リストを提案します
            </p>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* 設定カード */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              提案設定
            </h2>
            
            <div className="space-y-4">
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
                        p-3 rounded-lg text-sm font-semibold border transition-colors
                        ${targetDays === days 
                          ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]'
                          : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-elevated)]'
                        }
                      `}
                    >
                      {days}日分
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateSuggestions}
                disabled={isLoading || !hasValidSettings}
                className="w-full"
              >
                {isLoading ? '提案を生成中...' : '買い出し提案を生成'}
              </Button>

              {!hasValidSettings && (
                <p className="text-sm text-orange-600 text-center">
                  ユーザー設定が必要です。設定ページで体質や好みを登録してください。
                </p>
              )}
            </div>
          </Card>

          {/* エラー表示 */}
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <div className="text-red-500">⚠️</div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </Card>
          )}

          {/* 提案結果 */}
          {suggestions && <ShoppingSuggestionResults suggestions={suggestions} />}
        </div>
      </div>
    </MainLayout>
  );
}

interface ShoppingSuggestionResultsProps {
  suggestions: ShoppingSuggestionResponse;
}

function ShoppingSuggestionResults({ suggestions }: ShoppingSuggestionResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* サマリーカード */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            提案サマリー
          </h3>
          <div className="text-xs font-semibold text-[var(--color-brand-primary)] bg-[var(--color-bg-elevated)] px-2 py-1 rounded-full border border-[var(--color-border-light)]">
            {suggestions.targetDays}日分
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-light)]">
            <div className="text-lg font-bold text-[var(--color-text-primary)]">
              ¥{suggestions.totalEstimatedCost.toLocaleString()}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">予算目安</div>
          </div>
          <div className="text-center p-3 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border-light)]">
            <div className="text-lg font-bold text-[var(--color-text-primary)]">
              {suggestions.suggestions.reduce((total, cat) => total + cat.items.length, 0)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">アイテム数</div>
          </div>
        </div>

        {/* 優先度表示 */}
        {suggestions.priorities.immediate.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-red-600 mb-1">🚨 今すぐ買うべき</div>
            <div className="flex flex-wrap gap-1">
              {suggestions.priorities.immediate.map((item, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* カテゴリ別提案 */}
      {suggestions.suggestions.map((category) => (
        <Card key={category.category} className="overflow-hidden">
          <button
            onClick={() => setSelectedCategory(
              selectedCategory === category.category ? null : category.category
            )}
            className="w-full p-4 text-left hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {getCategoryIcon(category.category)}
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">
                    {category.displayName}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {category.items.length}アイテム
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {category.urgency === 'high' && (
                  <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200">
                    急ぎ
                  </span>
                )}
                <div className={`
                  w-5 h-5 flex items-center justify-center rounded-full transition-transform duration-200
                  ${selectedCategory === category.category ? 'rotate-180' : ''}
                `}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </button>

          {selectedCategory === category.category && (
            <div className="px-4 pb-4 bg-[var(--color-bg-elevated)]">
              <div className="space-y-3">
                {category.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-light)]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--color-text-primary)]">
                          {item.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                          {item.reason}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                          ¥{item.estimatedPrice}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          {item.shelfLife}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span>🎯</span>
                        <span className="text-[var(--color-text-tertiary)]">
                          優先度: {item.priority}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="text-[var(--color-text-tertiary)]">
                          栄養価: {item.nutritionalValue}/10
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔄</span>
                        <span className="text-[var(--color-text-tertiary)]">
                          汎用性: {item.versatility}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* 栄養バランス表示 */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          栄養バランス予測
        </h3>
        <div className="space-y-2">
          {Object.entries(suggestions.nutritionalBalance).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {getNutritionLabel(key)}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[var(--color-bg-elevated)] rounded-full">
                  <div 
                    className="h-2 bg-[var(--color-brand-primary)] rounded-full"
                    style={{ width: `${Math.min(100, (value / 50) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] w-8">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
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

function getNutritionLabel(key: string): string {
  const labels: { [key: string]: string } = {
    protein: 'タンパク質',
    vegetables: '野菜・食物繊維',
    carbohydrates: '炭水化物',
    fats: '良質な脂質',
    vitamins: 'ビタミン・ミネラル'
  };
  return labels[key] || key;
}