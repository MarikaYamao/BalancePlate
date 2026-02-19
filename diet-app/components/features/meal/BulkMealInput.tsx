'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { MealType } from '@/types';

interface BulkMealInputProps {
  missedMeals: MealType[];
  onSubmit: (meals: Record<MealType, string>) => Promise<void>;
  onCancel: () => void;
}

export function BulkMealInput({ missedMeals, onSubmit, onCancel }: BulkMealInputProps) {
  const [mealData, setMealData] = useState<Record<MealType, string>>({
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skippedMeals, setSkippedMeals] = useState<Set<MealType>>(new Set());

  const mealLabels = {
    breakfast: { label: '朝食', icon: '🌅', time: '朝' },
    lunch: { label: '昼食', icon: '☀️', time: '昼' },
    dinner: { label: '夕食', icon: '🌙', time: '夜' },
    snack: { label: '間食', icon: '🍪', time: '間' }
  };

  const handleInputChange = (mealType: MealType, value: string) => {
    setMealData(prev => ({
      ...prev,
      [mealType]: value
    }));
  };

  const handleSkipToggle = (mealType: MealType) => {
    setSkippedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealType)) {
        newSet.delete(mealType);
      } else {
        newSet.add(mealType);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // スキップされた食事は空文字に設定
      const submissionData: Record<MealType, string> = { ...mealData };
      skippedMeals.forEach(mealType => {
        submissionData[mealType] = '';
      });

      // 実際に入力された食事のみ送信
      const filteredData: Record<MealType, string> = {} as Record<MealType, string>;
      missedMeals.forEach(mealType => {
        if (!skippedMeals.has(mealType) && mealData[mealType].trim()) {
          filteredData[mealType] = mealData[mealType];
        }
      });

      await onSubmit(filteredData);
    } catch (error) {
      console.error('Failed to submit bulk meals:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyInput = missedMeals.some(mealType => 
    !skippedMeals.has(mealType) && mealData[mealType].trim()
  );

  if (missedMeals.length === 0) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4 bg-[var(--color-bg-subtle)] border-[var(--color-border-default)]">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg">📝</div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            未入力の食事を記録
          </h3>
        </div>
        
        <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">
          {missedMeals.length}つの食事が未記録です。まとめて入力できます。
        </p>

        <div className="space-y-4">
          {missedMeals.map(mealType => {
            const isSkipped = skippedMeals.has(mealType);
            
            return (
              <div key={mealType} className={`
                border rounded-lg p-3 transition-all duration-200
                ${isSkipped ? 'border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] opacity-60' : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)]'}
              `}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{mealLabels[mealType].icon}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {mealLabels[mealType].label}
                  </span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => handleSkipToggle(mealType)}
                    className={`
                      px-2 py-1 text-xs rounded font-medium transition-colors duration-200
                      ${isSkipped 
                        ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)]' 
                        : 'bg-[var(--color-warning)] bg-opacity-20 text-[var(--color-warning)] hover:bg-opacity-30'}
                    `}
                  >
                    {isSkipped ? '記録する' : 'スキップ'}
                  </button>
                </div>
                
                <textarea
                  value={mealData[mealType]}
                  onChange={(e) => handleInputChange(mealType, e.target.value)}
                  disabled={isSkipped}
                  placeholder={isSkipped ? 'スキップされました' : `${mealLabels[mealType].time}に食べたものを入力してください...`}
                  className={`
                    w-full p-2 border rounded text-sm resize-none font-medium
                    ${isSkipped 
                      ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] cursor-not-allowed' 
                      : 'border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]'}
                  `}
                  rows={2}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={!hasAnyInput || isSubmitting}
            variant="primary"
            className="flex-1"
          >
            {isSubmitting ? '保存中...' : '記録を保存'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>

        <p className="text-xs text-[var(--color-text-tertiary)] font-medium mt-2 text-center">
          空欄の食事は記録されません
        </p>
      </div>
    </Card>
  );
}